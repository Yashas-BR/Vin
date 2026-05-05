import React, { useState } from 'react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I\'m your farm assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { role: 'user', text: input }]);
    setInput('');

    // Simulate bot response (in real app, call Gemini API)
    setTimeout(() => {
      let botText = 'I understand. Here\'s what I found:';
      if (input.toLowerCase().includes('rain')) {
        botText = `Based on the forecast, there's a 60% chance of rain tomorrow. I recommend applying runoff management before the weather changes. Your runoff risk score is currently 6.1/10.`;
      } else if (input.toLowerCase().includes('withdrawal')) {
        botText = `Based on your active treatments, no animals are cleared for milk production yet. Cattle will be cleared in 5 days, poultry in 2 days.`;
      } else if (input.toLowerCase().includes('treatment')) {
        botText = `You have 3 active treatments. The Amoxicillin treatment is highest risk (7.8/10). Recommend discussing withdrawal schedule with your vet.`;
      } else if (input.toLowerCase().includes('help')) {
        botText = `I can help with:\n• Weather and runoff risk forecasts\n• Withdrawal period tracking\n• Treatment records\n• Alert explanations\n\nTry asking about rain, withdrawal periods, or your current treatments!`;
      }

      setMessages(prev => [...prev, { role: 'bot', text: botText }]);
    }, 600);
  };

  const languages = {
    en: 'English',
    hi: 'हिंदी',
    ta: 'தமிழ்',
  };

  return (
    <div className="chatbot-container">
      {/* Floating Button */}
      <button
        className="chatbot-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Farm Assistant"
      >
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Farm Assistant</h3>
            <div className="header-controls">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="language-select"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsOpen(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message ${msg.role}`}
              >
                <div className="message-bubble">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about weather, treatments..."
              className="chatbot-input"
            />
            <button onClick={handleSend} className="send-btn">
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
