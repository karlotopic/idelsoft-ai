import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Paper,
  Divider,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';

const drawerWidth = 320;

export default function Home() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [aiPromptOpen, setAiPromptOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [emailsLoading, setEmailsLoading] = useState(true);
  
  const [composeForm, setComposeForm] = useState({
    to: '',
    cc: '',
    bcc: '',
    subject: '',
    body: ''
  });
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [streamingSubject, setStreamingSubject] = useState('');
  const [streamingBody, setStreamingBody] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Fetch emails on component mount
  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setEmailsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/emails');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      // You could add a toast notification here
    } finally {
      setEmailsLoading(false);
    }
  };

  const handleEmailSelect = async (emailId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/emails/${emailId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedEmail(data.email);
    } catch (error) {
      console.error('Failed to fetch email:', error);
    }
  };

  const handleComposeSubmit = async () => {
    // Validate required fields
    if (!composeForm.to.trim() || !composeForm.subject.trim() || !composeForm.body.trim()) {
      alert('Please fill in all required fields (To, Subject, and Body)');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(composeForm),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEmails([data.email, ...emails]);
      setComposeOpen(false);
      setComposeForm({ to: '', cc: '', bcc: '', subject: '', body: '' });
    } catch (error) {
      console.error('Failed to create email:', error);
      // You could add a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    
    setAiLoading(true);
    setIsStreaming(true);
    setStreamingSubject('');
    setStreamingBody('');
    setComposeForm(prev => ({ ...prev, subject: '', body: '' }));
    
    try {
      const response = await fetch('http://localhost:3001/api/emails/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.email) {
                // Update the form with the received email data
                setComposeForm(prev => ({
                  ...prev,
                  subject: data.email.subject || prev.subject,
                  body: data.email.body || prev.body
                }));
                
                // Update streaming display
                setStreamingSubject(data.email.subject || '');
                setStreamingBody(data.email.body || '');
              } else if (data.type === 'error') {
                console.error('AI generation error:', data.error);
                setIsStreaming(false);
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
      
      // Close the AI prompt dialog when streaming is complete
      setAiPromptOpen(false);
      setAiPrompt('');
      setIsStreaming(false);
      
    } catch (error) {
      console.error('Failed to generate email:', error);
      setIsStreaming(false);
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div">
            Email App
          </Typography>
        </Box>
        <List sx={{ flex: 1, overflow: 'auto' }}>
          {emailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : emails.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No emails yet
              </Typography>
            </Box>
          ) : (
            emails.map((email) => (
              <ListItem
                key={email.id}
                button
                selected={selectedEmail?.id === email.id}
                onClick={() => handleEmailSelect(email.id)}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                  },
                }}
              >
                <ListItemText
                  primary={email.subject || 'No Subject'}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        To: {email.to}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(email.created_at)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedEmail ? (
          <Box sx={{ p: 3, flex: 1 }}>
            <Typography variant="h5" gutterBottom>
              {selectedEmail.subject || 'No Subject'}
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>To:</strong> {selectedEmail.to}
              </Typography>
              {selectedEmail.cc && (
                <Typography variant="body2" color="text.secondary">
                  <strong>CC:</strong> {selectedEmail.cc}
                </Typography>
              )}
              {selectedEmail.bcc && (
                <Typography variant="body2" color="text.secondary">
                  <strong>BCC:</strong> {selectedEmail.bcc}
                </Typography>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedEmail.body}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'grey.50'
          }}>
            <Typography variant="h6" color="text.secondary">
              Select an email from the sidebar to view
            </Typography>
          </Box>
        )}
      </Box>

      {/* Compose FAB */}
      <Fab
        color="primary"
        aria-label="compose"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setComposeOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Compose Dialog */}
      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Compose Email</Typography>
            <IconButton onClick={() => setComposeOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="To"
              value={composeForm.to}
              onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
              fullWidth
            />
            <TextField
              label="CC"
              value={composeForm.cc}
              onChange={(e) => setComposeForm(prev => ({ ...prev, cc: e.target.value }))}
              fullWidth
            />
            <TextField
              label="BCC"
              value={composeForm.bcc}
              onChange={(e) => setComposeForm(prev => ({ ...prev, bcc: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Subject"
              value={composeForm.subject}
              onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
              fullWidth
            />
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Body"
                value={composeForm.body}
                onChange={(e) => setComposeForm(prev => ({ ...prev, body: e.target.value }))}
                multiline
                rows={8}
                fullWidth
                disabled={isStreaming}
              />
              <IconButton
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => setAiPromptOpen(true)}
                color="primary"
                disabled={isStreaming}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  AI ✨
                </Typography>
              </IconButton>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeOpen(false)}>Cancel</Button>
          <Button
            onClick={handleComposeSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* AI Prompt Dialog */}
      <Dialog
        open={aiPromptOpen}
        onClose={() => setAiPromptOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">AI Email Generation</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {!isStreaming ? (
            <>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Describe what you want the email to be about (e.g., "Meeting request for Tuesday")
              </Typography>
              <TextField
                label="Email Description"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="e.g., Meeting request for Tuesday"
              />
            </>
          ) : (
            <Box sx={{ mt: 1 }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Generating your email...
              </Typography>
              
              {streamingSubject && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {streamingSubject}
                  </Typography>
                </Box>
              )}
              
              {streamingBody && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Body:
                  </Typography>
                  <Typography variant="body1">
                    {streamingBody}
                  </Typography>
                </Box>
              )}
              
              {!streamingSubject && !streamingBody && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Generating your email...
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setAiPromptOpen(false);
              setIsStreaming(false);
              setStreamingSubject('');
              setStreamingBody('');
            }}
            disabled={isStreaming}
          >
            Cancel
          </Button>
          {!isStreaming && (
            <Button
              onClick={handleAIGenerate}
              variant="contained"
              disabled={aiLoading || !aiPrompt.trim()}
              startIcon={aiLoading ? <CircularProgress size={20} /> : <AutoAwesome />}
            >
              {aiLoading ? 'Generating...' : 'Generate Email'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
