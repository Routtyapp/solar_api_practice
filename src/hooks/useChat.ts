import { useState, useCallback } from 'react';
import { streamChat, type ChatMessage } from '../api/solar';
import { parseDocument, isImageFile } from '../services/documentService';
import {
  extractInformation,
  parseExtractionResult,
  generateSchemaFromQuery,
  formatExtractedData,
} from '../services/extractionService';

export interface FileAttachment {
  name: string;
  type: string;
  size: number;
  parsedContent?: string;
  extractedData?: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachment?: FileAttachment;
}

export interface ChatRoom {
  id: string;
  title: string;
  lastMessage?: string;
  createdAt: Date;
}

export function useChat() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);

  const currentMessages = currentChatId ? messages[currentChatId] || [] : [];
  const isNewChat = currentChatId === null || currentMessages.length === 0;

  const createNewChat = useCallback(() => {
    const newId = Date.now().toString();
    const newRoom: ChatRoom = {
      id: newId,
      title: '새 채팅',
      createdAt: new Date(),
    };
    setChatRooms((prev) => [newRoom, ...prev]);
    setCurrentChatId(newId);
    setMessages((prev) => ({ ...prev, [newId]: [] }));
    return newId;
  }, []);

  const selectChat = useCallback((id: string) => {
    setCurrentChatId(id);
  }, []);

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === chatId && room.title === '새 채팅'
          ? { ...room, title: title.slice(0, 30) + (title.length > 30 ? '...' : '') }
          : room
      )
    );
  }, []);

  const addMessage = useCallback((chatId: string, message: Message) => {
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message],
    }));
  }, []);

  const appendToLastMessage = useCallback((chatId: string, messageId: string, chunk: string) => {
    setMessages((prev) => {
      const chatMessages = prev[chatId] || [];
      const lastMessage = chatMessages[chatMessages.length - 1];

      if (lastMessage && lastMessage.id === messageId) {
        return {
          ...prev,
          [chatId]: [
            ...chatMessages.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + chunk },
          ],
        };
      }
      return prev;
    });
  }, []);

  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      let chatId = currentChatId;

      if (!chatId) {
        chatId = createNewChat();
      }

      let parsedContent = '';
      let attachment: FileAttachment | undefined;

      // Handle file upload and parsing
      if (file) {
        setIsParsingFile(true);
        attachment = {
          name: file.name,
          type: file.type,
          size: file.size,
        };

        try {
          const result = await parseDocument(file);
          parsedContent = result.content?.text || '';
          attachment.parsedContent = parsedContent;
        } catch (error) {
          console.error('Error parsing document:', error);
          parsedContent = '[문서 파싱 실패]';
        } finally {
          setIsParsingFile(false);
        }

        // Information Extraction for images
        if (isImageFile(file) && content) {
          setIsExtracting(true);
          try {
            const schema = generateSchemaFromQuery(content);
            const extractionResult = await extractInformation(file, schema);
            const extractedData = parseExtractionResult(extractionResult);
            if (extractedData) {
              attachment.extractedData = extractedData;
            }
          } catch (error) {
            console.error('Error extracting information:', error);
          } finally {
            setIsExtracting(false);
          }
        }
      }

      // Build user message content
      let userMessageContent = content;
      if (!content && file) {
        userMessageContent = `${file.name} 파일을 분석해주세요.`;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessageContent,
        timestamp: new Date(),
        attachment,
      };
      addMessage(chatId, userMessage);

      // Update chat title
      const titleContent = content || (file ? `📎 ${file.name}` : '');
      updateChatTitle(chatId, titleContent);

      // Prepare messages for API with file context
      const currentChatMessages = messages[chatId] || [];
      const apiMessages: ChatMessage[] = [
        ...currentChatMessages.map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.attachment?.parsedContent
            ? `[첨부 파일: ${msg.attachment.name}]\n\n파일 내용:\n${msg.attachment.parsedContent}\n\n사용자 질문: ${msg.content}`
            : msg.content,
        })),
      ];

      // Add current message with file context
      if (parsedContent || attachment?.extractedData) {
        let contextContent = `[첨부 파일: ${file!.name}]\n\n`;

        if (parsedContent) {
          contextContent += `파일 내용:\n${parsedContent}\n\n`;
        }

        if (attachment?.extractedData) {
          contextContent += `추출된 정보:\n${formatExtractedData(attachment.extractedData)}\n\n`;
        }

        contextContent += `사용자 질문: ${userMessageContent}`;

        apiMessages.push({
          role: 'user' as const,
          content: contextContent,
        });
      } else {
        apiMessages.push({ role: 'user' as const, content: userMessageContent });
      }

      setIsLoading(true);

      try {
        const aiMessageId = (Date.now() + 1).toString();

        // Add empty assistant message
        addMessage(chatId, {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        });

        // Stream the response
        for await (const chunk of streamChat(apiMessages)) {
          appendToLastMessage(chatId, aiMessageId, chunk);
        }
      } catch (error) {
        console.error('Error streaming response:', error);

        // Update with error message
        setMessages((prev) => {
          const chatMessages = prev[chatId] || [];
          const lastMessage = chatMessages[chatMessages.length - 1];

          if (lastMessage && lastMessage.role === 'assistant' && lastMessage.content === '') {
            return {
              ...prev,
              [chatId]: [
                ...chatMessages.slice(0, -1),
                {
                  ...lastMessage,
                  content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다. 다시 시도해 주세요.',
                },
              ],
            };
          }
          return prev;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId, createNewChat, addMessage, updateChatTitle, messages, appendToLastMessage]
  );

  return {
    // State
    chatRooms,
    currentChatId,
    currentMessages,
    isLoading,
    isNewChat,
    isParsingFile,
    isExtracting,

    // Actions
    createNewChat,
    selectChat,
    sendMessage,
  };
}
