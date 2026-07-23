import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Slide,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import { useAIChat, type AIMessage } from '../../hooks/useAI';

type ChatMessage = AIMessage & {
  id: string;
};

const MAX_MESSAGES = 16;

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi! I am your library assistant. Ask me for book suggestions, summaries, or reading help.'
};

export const FloatingChatbot = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const chatMutation = useAIChat();

  const historyForApi = useMemo(
    () => messages.filter((message) => message.id !== 'welcome').map(({ role, content }) => ({ role, content })),
    [messages]
  );

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed
    };

    const nextHistory: AIMessage[] = [...historyForApi, { role: userMessage.role, content: userMessage.content }];

    setMessages((prev) => [...prev, userMessage].slice(-MAX_MESSAGES));
    setInput('');

    try {
      const responseText = await chatMutation.mutateAsync({ messages: nextHistory });
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: String(responseText || 'I could not generate a response right now.')
      };
      setMessages((prev) => [...prev, assistantMessage].slice(-MAX_MESSAGES));
    } catch {
      const errorMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: 'The assistant is unavailable at the moment. Please try again shortly.'
      };
      setMessages((prev) => [...prev, errorMessage].slice(-MAX_MESSAGES));
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <>
      <Slide direction='up' in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={16}
          sx={{
            position: 'fixed',
            right: { xs: 12, sm: 20 },
            bottom: { xs: 80, sm: 92 },
            width: { xs: 'calc(100vw - 24px)', sm: 370 },
            maxWidth: 370,
            height: { xs: '60vh', sm: 520 },
            zIndex: (muiTheme) => muiTheme.zIndex.modal + 2,
            borderRadius: 1.5,
            overflow: 'hidden',
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              px: 1.75,
              py: 1.25,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(120deg, rgba(43,112,111,0.92) 0%, rgba(21,33,45,0.94) 100%)'
                : 'linear-gradient(120deg, rgba(11,110,109,0.96) 0%, rgba(37,70,100,0.94) 100%)',
              color: 'common.white'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <SmartToyRoundedIcon fontSize='small' />
            </Box>
            <Typography variant='subtitle2' sx={{ fontWeight: 700, textAlign: 'center' }}>
              Read Colab Assistant
            </Typography>
            <IconButton
              size='small'
              onClick={() => setOpen(false)}
              sx={{ color: 'common.white', justifySelf: 'end' }}
            >
              <CloseRoundedIcon fontSize='small' />
            </IconButton>
          </Box>

          <Box sx={{ p: 1.25, overflowY: 'auto', bgcolor: 'background.default' }}>
            <Stack spacing={1.1}>
              {messages.map((message) => {
                const fromUser = message.role === 'user';
                return (
                  <Box
                    key={message.id}
                    sx={{
                      alignSelf: fromUser ? 'flex-end' : 'flex-start',
                      maxWidth: '88%',
                      px: 1.2,
                      py: 0.9,
                      borderRadius: 1.5,
                      bgcolor: fromUser ? 'primary.main' : 'background.paper',
                      color: fromUser ? 'primary.contrastText' : 'text.primary',
                      border: fromUser ? 'none' : '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                  </Box>
                );
              })}
              {chatMutation.isPending && (
                <Stack direction='row' spacing={1} alignItems='center' sx={{ pl: 0.5 }}>
                  <CircularProgress size={14} />
                  <Typography variant='caption' color='text.secondary'>
                    Assistant is thinking...
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          <Box sx={{ p: 1.2, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            {chatMutation.isError && (
              <Alert severity='warning' sx={{ mb: 1 }}>
                Could not connect to chatbot API.
              </Alert>
            )}
            <Stack direction='row' spacing={1}>
              <TextField
                fullWidth
                size='small'
                placeholder='Ask anything about books...'
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleInputKeyDown}
                multiline
                maxRows={3}
              />
              <IconButton
                color='primary'
                onClick={() => {
                  void sendMessage();
                }}
                disabled={!input.trim() || chatMutation.isPending}
              >
                <SendRoundedIcon />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      </Slide>

      <Tooltip title='Chat with assistant' placement='left'>
        <Fab
          color='primary'
          aria-label='Open chatbot'
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            position: 'fixed',
            right: { xs: 12, sm: 20 },
            bottom: { xs: 16, sm: 20 },
            zIndex: (muiTheme) => muiTheme.zIndex.modal + 3,
            boxShadow: '0 12px 28px rgba(11,110,109,0.35)',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: -7,
              borderRadius: '50%',
              border: '2px solid rgba(11,110,109,0.28)',
              animation: 'chatPulse 1900ms ease-out infinite'
            },
            '@keyframes chatPulse': {
              '0%': { transform: 'scale(0.9)', opacity: 0.55 },
              '70%': { transform: 'scale(1.14)', opacity: 0 },
              '100%': { transform: 'scale(1.14)', opacity: 0 }
            }
          }}
        >
          <ChatRoundedIcon />
        </Fab>
      </Tooltip>
    </>
  );
};
