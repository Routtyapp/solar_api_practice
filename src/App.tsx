import { useState } from 'react';
import { ConfigProvider, Modal, Switch, Typography, Grid, Drawer, Tabs } from 'antd';
import {
  MessageOutlined,
  FileTextOutlined,
  SearchOutlined,
  LayoutOutlined,
} from '@ant-design/icons';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import { useChat } from './hooks/useChat';
import './App.css';

const { Text } = Typography;
const { useBreakpoint } = Grid;

// 다크모드 팔레트
const darkTheme = {
  bg: '#121212',
  bgSecondary: '#1E1E1E',
  bgTertiary: '#2A2A2A',
  textPrimary: '#E0E0E0',
  textSecondary: '#B0B0B0',
  border: '#444444',
  accent: '#888888',
};

const lightTheme = {
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  bgTertiary: '#F5F5F5',
  textPrimary: '#262626',
  textSecondary: '#595959',
  border: '#E8E8E8',
  accent: '#8C8C8C',
};

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const screens = useBreakpoint();

  const theme = isDarkMode ? darkTheme : lightTheme;

  const {
    chatRooms,
    currentChatId,
    currentMessages,
    isLoading,
    isNewChat,
    isParsingFile,
    isExtracting,
    createNewChat,
    selectChat,
    sendMessage,
  } = useChat();

  // md (768px) 미만이면 모바일
  const isMobile = !screens.md;

  const handleMenuClick = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleSelectChat = (id: string) => {
    selectChat(id);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleNewChat = () => {
    createNewChat();
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: isDarkMode ? '#888888' : '#262626',
          colorBgContainer: theme.bg,
          colorBgElevated: theme.bgSecondary,
          colorText: theme.textPrimary,
          colorTextSecondary: theme.textSecondary,
          colorBorder: theme.border,
          borderRadius: 8,
          fontFamily:
            "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        },
        components: {
          Modal: {
            contentBg: theme.bgSecondary,
            headerBg: theme.bgSecondary,
            titleColor: theme.textPrimary,
          },
          Tabs: {
            itemColor: theme.textSecondary,
            itemSelectedColor: theme.textPrimary,
            inkBarColor: isDarkMode ? '#888888' : '#262626',
          },
          Input: {
            colorBgContainer: theme.bgTertiary,
            colorBorder: theme.border,
            colorText: theme.textPrimary,
            colorTextPlaceholder: theme.textSecondary,
          },
          Button: {
            colorText: theme.textPrimary,
            colorBgContainer: theme.bg,
            colorBorder: theme.border,
          },
        },
      }}
    >
      <div
        style={{
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          backgroundColor: theme.bg,
          display: 'flex',
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div
            style={{
              width: sidebarCollapsed ? 60 : 260,
              minWidth: sidebarCollapsed ? 60 : 260,
              height: '100vh',
              transition: 'all 0.2s ease',
            }}
          >
            <Sidebar
              chatRooms={chatRooms}
              currentChatId={currentChatId}
              onNewChat={createNewChat}
              onSelectChat={selectChat}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenGuide={() => setGuideOpen(true)}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
              isDarkMode={isDarkMode}
              theme={theme}
            />
          </div>
        )}

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            height: '100vh',
          }}
        >
          <ChatArea
            messages={currentMessages}
            onSendMessage={sendMessage}
            isNewChat={isNewChat}
            isLoading={isLoading}
            isParsingFile={isParsingFile}
            isExtracting={isExtracting}
            isMobile={isMobile}
            onMenuClick={handleMenuClick}
            isDarkMode={isDarkMode}
            theme={theme}
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={handleDrawerClose}
          width={280}
          styles={{
            body: { padding: 0, backgroundColor: theme.bgSecondary },
            header: { display: 'none' },
            wrapper: { backgroundColor: theme.bgSecondary },
          }}
        >
          <Sidebar
            chatRooms={chatRooms}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onOpenSettings={() => setSettingsOpen(true)}
            onOpenGuide={() => setGuideOpen(true)}
            isDarkMode={isDarkMode}
            theme={theme}
          />
        </Drawer>
      )}

      {/* Settings Modal */}
      <Modal
        title="설정"
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        footer={null}
        centered
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
          wrapper: { backgroundColor: theme.bgSecondary },
          header: { backgroundColor: theme.bgSecondary },
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <Text style={{ color: theme.textPrimary }}>다크 모드</Text>
            <Switch checked={isDarkMode} onChange={setIsDarkMode} />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <Text style={{ color: theme.textPrimary }}>알림</Text>
            <Switch defaultChecked />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
            }}
          >
            <Text style={{ color: theme.textPrimary }}>자동 저장</Text>
            <Switch defaultChecked />
          </div>
        </div>
      </Modal>

      {/* Guide Modal */}
      <Modal
        title={null}
        open={guideOpen}
        onCancel={() => setGuideOpen(false)}
        footer={null}
        centered
        width={640}
        styles={{
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.45)' },
          body: { padding: 0 },
          wrapper: { borderRadius: 16, overflow: 'hidden' },
        }}
      >
        {/* 모달 헤더 */}
        <div
          style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid #F0F0F0',
            background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img src="/logo.svg" alt="Logo" style={{ width: 24, height: 24, filter: 'brightness(0) invert(1)' }} />
            </div>
            <div>
              <Text strong style={{ fontSize: 18, display: 'block', color: '#262626' }}>
                이용 가이드
              </Text>
              <Text style={{ fontSize: 13, color: '#8C8C8C' }}>
                Solar AI의 주요 기능을 알아보세요
              </Text>
            </div>
          </div>
        </div>

        <Tabs
          defaultActiveKey="chat"
          tabPosition="top"
          style={{ minHeight: 340 }}
          tabBarStyle={{
            padding: '0 28px',
            marginBottom: 0,
            borderBottom: '1px solid #F0F0F0',
          }}
          items={[
            {
              key: 'chat',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                  <MessageOutlined style={{ fontSize: 15 }} />
                  채팅
                </span>
              ),
              children: (
                <div style={{ padding: '24px 28px', lineHeight: 1.8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 16,
                      padding: '12px 16px',
                      backgroundColor: '#F0F7FF',
                      borderRadius: 10,
                      border: '1px solid #BAE0FF',
                    }}
                  >
                    <MessageOutlined style={{ fontSize: 20, color: '#1677FF' }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>
                      AI 채팅 기능
                    </Text>
                  </div>
                  <Text style={{ color: '#595959', display: 'block', marginBottom: 16 }}>
                    Solar AI와 자연스러운 대화를 나눌 수 있습니다.
                  </Text>
                  <ul style={{ paddingLeft: 20, margin: 0, color: '#595959' }}>
                    <li style={{ marginBottom: 10 }}>하단 입력창에 질문이나 요청사항을 입력하세요</li>
                    <li style={{ marginBottom: 10 }}>Enter 키를 누르거나 전송 버튼을 클릭하면 메시지가 전송됩니다</li>
                    <li style={{ marginBottom: 10 }}>Shift + Enter로 줄바꿈이 가능합니다</li>
                    <li>대화 내용은 자동으로 저장되며 사이드바에서 이전 대화를 확인할 수 있습니다</li>
                  </ul>
                </div>
              ),
            },
            {
              key: 'file',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                  <FileTextOutlined style={{ fontSize: 15 }} />
                  문서 분석
                </span>
              ),
              children: (
                <div style={{ padding: '24px 28px', lineHeight: 1.8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 16,
                      padding: '12px 16px',
                      backgroundColor: '#F6FFED',
                      borderRadius: 10,
                      border: '1px solid #B7EB8F',
                    }}
                  >
                    <FileTextOutlined style={{ fontSize: 20, color: '#52C41A' }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>
                      문서 업로드 및 분석
                    </Text>
                  </div>
                  <Text style={{ color: '#595959', display: 'block', marginBottom: 16 }}>
                    다양한 형식의 문서를 업로드하여 AI가 내용을 분석해 드립니다.
                  </Text>
                  <ul style={{ paddingLeft: 20, margin: 0, color: '#595959' }}>
                    <li style={{ marginBottom: 10 }}>클립 아이콘을 클릭하여 파일을 첨부할 수 있습니다</li>
                    <li style={{ marginBottom: 10 }}>지원 형식: PDF, 이미지(PNG, JPG 등), Word, Excel, PowerPoint</li>
                    <li style={{ marginBottom: 10 }}>문서 내용을 요약하거나 특정 정보를 질문할 수 있습니다</li>
                    <li>이미지의 경우 텍스트 추출(OCR) 및 내용 분석이 가능합니다</li>
                  </ul>
                </div>
              ),
            },
            {
              key: 'extract',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                  <SearchOutlined style={{ fontSize: 15 }} />
                  정보 추출
                </span>
              ),
              children: (
                <div style={{ padding: '24px 28px', lineHeight: 1.8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 16,
                      padding: '12px 16px',
                      backgroundColor: '#FFF7E6',
                      borderRadius: 10,
                      border: '1px solid #FFD591',
                    }}
                  >
                    <SearchOutlined style={{ fontSize: 20, color: '#FA8C16' }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>
                      스마트 정보 추출
                    </Text>
                  </div>
                  <Text style={{ color: '#595959', display: 'block', marginBottom: 16 }}>
                    문서에서 핵심 정보를 자동으로 추출하여 구조화된 데이터로 제공합니다.
                  </Text>
                  <ul style={{ paddingLeft: 20, margin: 0, color: '#595959' }}>
                    <li style={{ marginBottom: 10 }}>명함, 영수증, 계약서 등에서 주요 정보 자동 추출</li>
                    <li style={{ marginBottom: 10 }}>추출된 정보는 키-값 형태로 깔끔하게 정리됩니다</li>
                    <li style={{ marginBottom: 10 }}>추출 결과를 바탕으로 추가 질문이 가능합니다</li>
                    <li>비정형 데이터를 정형 데이터로 변환하는 데 유용합니다</li>
                  </ul>
                </div>
              ),
            },
            {
              key: 'interface',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                  <LayoutOutlined style={{ fontSize: 15 }} />
                  인터페이스
                </span>
              ),
              children: (
                <div style={{ padding: '24px 28px', lineHeight: 1.8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginBottom: 16,
                      padding: '12px 16px',
                      backgroundColor: '#F9F0FF',
                      borderRadius: 10,
                      border: '1px solid #D3ADF7',
                    }}
                  >
                    <LayoutOutlined style={{ fontSize: 20, color: '#722ED1' }} />
                    <Text strong style={{ fontSize: 15, color: '#262626' }}>
                      화면 구성 및 사용법
                    </Text>
                  </div>
                  <Text style={{ color: '#595959', display: 'block', marginBottom: 16 }}>
                    효율적인 사용을 위한 인터페이스 기능을 안내합니다.
                  </Text>
                  <ul style={{ paddingLeft: 20, margin: 0, color: '#595959' }}>
                    <li style={{ marginBottom: 10 }}>사이드바 상단의 접기 버튼으로 사이드바를 축소할 수 있습니다</li>
                    <li style={{ marginBottom: 10 }}>'새 채팅' 버튼으로 새로운 대화를 시작할 수 있습니다</li>
                    <li style={{ marginBottom: 10 }}>사이드바에서 이전 대화 목록을 확인하고 선택할 수 있습니다</li>
                    <li>하단 설정 버튼에서 다크 모드, 알림 등을 설정할 수 있습니다</li>
                  </ul>
                </div>
              ),
            },
          ]}
        />
      </Modal>
    </ConfigProvider>
  );
}

export default App;
