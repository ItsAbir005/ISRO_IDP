import React, { useState, useEffect, useRef } from "react";
import { getUserData } from "../hooks/useLocalStorage";
import { API_URL } from "../config/api";

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [vitals, setVitals] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // ✅ Load user-specific vitals
  useEffect(() => {
    const savedVitals = getUserData("vitals");
    if (savedVitals && savedVitals.length > 0) {
      setVitals(savedVitals[savedVitals.length - 1]);
    }
  }, []);

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Welcome message with helpful suggestions
  useEffect(() => {
    const streak = getUserData("streak") || 0;
    const hasGreeted = sessionStorage.getItem("hasGreeted");

    if (!hasGreeted) {
      const welcomeMsg = streak >= 3
        ? `👋 Welcome back! You're on a ${streak}-day streak — that's fantastic! 💪\n\nI'm your HealthMate AI. I can help you with:\n• Understanding your vitals\n• Health tips and advice\n• Fitness guidance\n• Wellness suggestions`
        : `🌟 Hello! I'm HealthMate, your personal health assistant! 🤖\n\nI can help you understand your:\n• Heart rate & blood pressure\n• Oxygen levels (SpO₂)\n• Body temperature\n• Daily steps & activity\n\nTry asking me about your health data!`;
      
      setMessages([
        { 
          sender: "bot", 
          text: welcomeMsg, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        },
      ]);

      sessionStorage.setItem("hasGreeted", "true");
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { 
      sender: "user", 
      text: input, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          vitals,
          history: updatedMessages.slice(-5),
        }),
      });

      const data = await res.json();

      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { 
            sender: "bot", 
            text: data.reply, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          },
        ]);
      }, 800); // Slight delay for natural feel
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ I'm having trouble connecting right now. Please try again in a moment.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const quickActions = [
    { icon: "🩺", text: "Show my vitals", action: "vitals" },
    { icon: "💓", text: "Heart rate advice", action: "heart" },
    { icon: "🩸", text: "What's SpO₂?", action: "spo2" },
    { icon: "🚶", text: "Steps goal tips", action: "steps" },
  ];

  const handleQuickAction = (action) => {
    let message = "";
    switch (action) {
      case "vitals":
        if (vitals && Object.keys(vitals).length > 0) {
          const msg = `📊 **Your Latest Vitals:**\n\n💓 Heart Rate: ${vitals.heartRate} bpm\n🩸 SpO₂: ${vitals.spo2}%\n🩺 Blood Pressure: ${vitals.bp} mmHg\n🌡️ Temperature: ${vitals.temp}°F\n👟 Steps: ${vitals.steps} steps\n\n${vitals.timestamp ? `📅 Logged: ${vitals.timestamp}` : ''}`;
          setMessages((prev) => [
            ...prev,
            { 
              sender: "bot", 
              text: msg, 
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              sender: "bot",
              text: "📝 You haven't logged any vitals yet. Head to 'Log Vitals' to track your health data!",
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
        return;
      case "heart":
        message = "Tell me about maintaining a healthy heart rate";
        break;
      case "spo2":
        message = "What is SpO₂ and why is it important?";
        break;
      case "steps":
        message = "How many steps should I take daily?";
        break;
      default:
        return;
    }
    setInput(message);
    setTimeout(() => sendMessage(), 100);
  };

  const exampleQuestions = [
    "Is my heart rate normal?",
    "What's a healthy blood pressure?",
    "How can I improve my SpO₂?",
    "Tips for better sleep?",
    "How much water should I drink?",
    "What's a good daily step count?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
      <div className="flex flex-col w-full max-w-3xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 text-center">
          <h2 className="text-2xl font-bold mb-1">💬 HealthMate AI</h2>
          <p className="text-sm text-blue-100">Your Personal Health Assistant</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ height: '500px' }}>
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤖</div>
              <p className="text-gray-600 mb-4">
                Hi! I'm here to help with your health questions.
              </p>
              <div className="bg-white rounded-xl p-4 shadow max-w-md mx-auto">
                <p className="text-sm text-gray-700 font-semibold mb-2">
                  💡 Try asking me:
                </p>
                <div className="space-y-2 text-left text-sm text-gray-600">
                  {exampleQuestions.slice(0, 3).map((q, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-blue-500">•</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                  m.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 shadow-md rounded-bl-none border border-gray-100"
                }`}
              >
                <p className="whitespace-pre-line text-sm leading-relaxed">{m.text}</p>
                {m.time && (
                  <span
                    className={`block text-xs mt-2 ${
                      m.sender === "user" ? "text-blue-100" : "text-gray-400"
                    }`}
                  >
                    {m.time}
                  </span>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-md border border-gray-100">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-t border-gray-200 p-3">
          <p className="text-xs text-gray-500 mb-2 text-center">Quick Actions:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleQuickAction(action.action)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1 shadow-sm"
              >
                <span>{action.icon}</span>
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about your health..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              onKeyDown={(e) => e.key === "Enter" && !isTyping && sendMessage()}
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isTyping}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
            >
              Send
            </button>
          </div>
          
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              💡 I can only answer health-related questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;