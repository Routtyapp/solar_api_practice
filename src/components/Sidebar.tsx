import { Button, List, Typography, Tooltip } from 'antd';
import {
  PlusOutlined,
  MessageOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { type ChatRoom } from '../hooks/useChat';

const { Text } = Typography;

interface Theme {
  bg: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
}

interface SidebarProps {
  chatRooms: ChatRoom[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  isDarkMode?: boolean;
  theme?: Theme;
}

const defaultTheme: Theme = {
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  bgTertiary: '#F5F5F5',
  textPrimary: '#262626',
  textSecondary: '#595959',
  border: '#E8E8E8',
  accent: '#8C8C8C',
};

export default function Sidebar({
  chatRooms,
  currentChatId,
  onNewChat,
  onSelectChat,
  onOpenSettings,
  onOpenGuide,
  collapsed = false,
  onToggleCollapse,
  isDarkMode = false,
  theme = defaultTheme,
}: SidebarProps) {
  if (collapsed) {
    // 접힌 상태의 미니멀한 사이드바
    return (
      <aside
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: theme.bgSecondary,
          borderRight: `1px solid ${theme.border}`,
          paddingTop: 12,
          paddingBottom: 16,
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* 펼치기 버튼 */}
        <Tooltip title="펼치기" placement="right">
          <Button
            type="text"
            icon={<MenuUnfoldOutlined style={{ fontSize: 18 }} />}
            onClick={onToggleCollapse}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textSecondary,
              marginBottom: 8,
            }}
          />
        </Tooltip>

        {/* 구분선 */}
        <div
          style={{
            width: 32,
            height: 1,
            backgroundColor: theme.border,
            marginBottom: 12,
          }}
        />

        {/* 이용 가이드 버튼 */}
        <Tooltip title="이용 가이드" placement="right">
          <Button
            type="text"
            icon={<QuestionCircleOutlined style={{ fontSize: 18 }} />}
            onClick={onOpenGuide}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textSecondary,
              marginBottom: 8,
            }}
          />
        </Tooltip>

        {/* 구분선 */}
        <div
          style={{
            width: 32,
            height: 1,
            backgroundColor: theme.border,
            marginBottom: 12,
          }}
        />

        {/* 새 채팅 버튼 */}
        <Tooltip title="새 채팅" placement="right">
          <Button
            type="default"
            icon={<PlusOutlined style={{ fontSize: 16 }} />}
            onClick={onNewChat}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: `1px dashed ${theme.border}`,
              backgroundColor: theme.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
              color: theme.textSecondary,
            }}
          />
        </Tooltip>

        {/* 채팅 목록 */}
        <div
          style={{
            flex: 1,
            width: '100%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '0 8px',
          }}
        >
          {chatRooms.map((room) => (
            <Tooltip key={room.id} title={room.title} placement="right">
              <Button
                type="text"
                icon={<MessageOutlined style={{ fontSize: 16 }} />}
                onClick={() => onSelectChat(room.id)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: currentChatId === room.id ? theme.bgTertiary : 'transparent',
                  color: currentChatId === room.id ? theme.textPrimary : theme.accent,
                }}
              />
            </Tooltip>
          ))}
        </div>

        {/* 설정 버튼 */}
        <Tooltip title="설정" placement="right">
          <Button
            type="text"
            icon={<SettingOutlined style={{ fontSize: 18 }} />}
            onClick={onOpenSettings}
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.textSecondary,
            }}
          />
        </Tooltip>
      </aside>
    );
  }

  // 펼쳐진 상태의 사이드바
  return (
    <aside
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.bgSecondary,
        borderRight: `1px solid ${theme.border}`,
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <img
          src="/font_logo.png"
          alt="Logo"
          style={{
            height: 26,
            objectFit: 'contain',
            filter: isDarkMode ? 'brightness(0) invert(1)' : 'none',
          }}
        />
        {onToggleCollapse && (
          <Tooltip title="접기" placement="right">
            <Button
              type="text"
              icon={<MenuFoldOutlined style={{ fontSize: 16 }} />}
              onClick={onToggleCollapse}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.accent,
              }}
            />
          </Tooltip>
        )}
      </div>

      {/* 이용 가이드 버튼 */}
      <div
        style={{
          padding: '8px 12px 12px',
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <Button
          type="default"
          icon={<QuestionCircleOutlined style={{ fontSize: 15 }} />}
          onClick={onOpenGuide}
          style={{
            width: '100%',
            height: 38,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: theme.textSecondary,
            fontSize: 13,
            border: `1px solid ${theme.border}`,
            backgroundColor: theme.bg,
          }}
        >
          이용 가이드
        </Button>
      </div>

      {/* New Chat Button */}
      <div style={{ padding: '12px 12px' }}>
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={onNewChat}
          style={{
            width: '100%',
            height: 42,
            borderRadius: 10,
            border: `1px dashed ${theme.border}`,
            backgroundColor: theme.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 500,
            color: theme.textPrimary,
          }}
        >
          새 채팅
        </Button>
      </div>

      {/* Chat List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 8px',
        }}
      >
        <List
          dataSource={chatRooms}
          locale={{ emptyText: null }}
          renderItem={(room) => (
            <List.Item
              onClick={() => onSelectChat(room.id)}
              style={{
                padding: '10px 12px',
                margin: '2px 0',
                borderRadius: 10,
                cursor: 'pointer',
                backgroundColor:
                  currentChatId === room.id ? theme.bgTertiary : 'transparent',
                border: 'none',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (currentChatId !== room.id) {
                  e.currentTarget.style.backgroundColor = theme.bgTertiary;
                }
              }}
              onMouseLeave={(e) => {
                if (currentChatId !== room.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                }}
              >
                <MessageOutlined style={{ color: theme.accent, fontSize: 15 }} />
                <Text
                  ellipsis
                  style={{
                    flex: 1,
                    color: theme.textPrimary,
                    fontSize: 14,
                  }}
                >
                  {room.title}
                </Text>
              </div>
            </List.Item>
          )}
        />
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '12px',
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <Button
          type="text"
          icon={<SettingOutlined style={{ fontSize: 16 }} />}
          onClick={onOpenSettings}
          style={{
            width: '100%',
            height: 42,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingLeft: 12,
            gap: 10,
            color: theme.textSecondary,
            fontSize: 14,
          }}
        >
          설정
        </Button>
      </div>
    </aside>
  );
}
