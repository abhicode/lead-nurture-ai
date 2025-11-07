import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Modal,
  Paper,
  CircularProgress,
  TextField,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import client from "../api/client";

interface Conversation {
  id: number;
  lead_name: string;
  lead_email: string;
  campaign_name: string;
  message_count: number;
}

interface Message {
  sender: string;
  content: string;
  timestamp: string;
}

const AiFollowUp: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [input, setInput] = useState("");

  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const res = await client.get("/conversations/");
      setConversations(res.data);
    };
    fetchConversations();
  }, []);

  // Fetch messages for selected conversation
  const handleView = async (id: number) => {
    setLoading(true);
    setSelectedConv(id);
    try {
      const res = await client.get(`/conversations/${id}/messages/`);
      setMessages(res.data.messages);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Send a message (your response)
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv) return;
    setSending(true);

    const userMsg = {
        sender: "lead",
        content: input,
        timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
        const res = await client.post("/ai/send_message/", {
        conversation_id: selectedConv,
        content: input,
        });

        if (res.data.status === "success") {
        const aiMsg = {
            sender: "ai",
            content: res.data.ai_message,
            timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        }
    } finally {
        setSending(false);
    }
    };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        AI Agent Follow-up Dashboard
      </Typography>

      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Lead Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Campaign</TableCell>
              <TableCell align="center">Messages</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conversations.map((conv) => (
              <TableRow key={conv.id}>
                <TableCell>{conv.lead_name}</TableCell>
                <TableCell>{conv.lead_email}</TableCell>
                <TableCell>{conv.campaign_name}</TableCell>
                <TableCell align="center">{conv.message_count}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleView(conv.id)}
                  >
                    View Conversation
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal for conversation */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%",
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            borderRadius: 2,
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Conversation #{selectedConv}
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : (
            <>
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {messages.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      alignSelf:
                        msg.sender === "ai" ? "flex-start" : "flex-end",
                      bgcolor:
                        msg.sender === "ai" ? "primary.light" : "grey.200",
                      color:
                        msg.sender === "ai" ? "primary.dark" : "text.primary",
                      p: 2,
                      borderRadius: 2,
                      maxWidth: "70%",
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {msg.content}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Message input */}
              <Box sx={{ borderTop: "1px solid #eee", pt: 1 }}>
                {sending && (
                    <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1, textAlign: "left" }}
                    >
                    AI is typing...
                    </Typography>
                )}

                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={sending}
                    />
                    <IconButton color="primary" onClick={handleSend} disabled={sending}>
                    <SendIcon />
                    </IconButton>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AiFollowUp;
