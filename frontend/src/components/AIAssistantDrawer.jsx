import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  ChevronRight, 
  Languages, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck,
  Maximize2,
  Minimize2,
  Navigation,
  Radio,
  Truck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SECTION_NAMES = {
  'dashboard': 'Command Dashboard',
  'route-intelligence': 'Route Intelligence',
  'convoy-telematics': 'Convoy Telematics (AIS-140)',
  'simulation': 'Hazard Simulation Studio & Field Incident Report',
  'field-report': 'Hazard Simulation Studio & Field Incident Report'
};

const SUGGESTED_PROMPTS = {
  'dashboard': [
    'How do I use the Command Dashboard?',
    'What is the Command Dashboard used for?',
    'Show active disaster relief metrics across the 8 NE states.'
  ],
  'route-intelligence': [
    'How do I calculate Fastest vs. Safest corridors?',
    'What is Route Intelligence used for?',
    'Explain geotechnical disaster-resilient routing.'
  ],
  'convoy-telematics': [
    'How do I track POL fuel tankers and medical aid?',
    'What is Convoy Telematics (AIS-140) used for?',
    'How do I execute an emergency A* bypass reroute?'
  ],
  'simulation': [
    'How do I simulate rainfall spikes via Open-Meteo?',
    'What is Hazard Simulation Studio used for?',
    'How do field incident reports update graph edge weights?'
  ],
  'field-report': [
    'How do I submit an offline field incident report?',
    'What is Hazard Simulation Studio & Field Incident Report used for?',
    'How does automated emergency rerouting trigger around blockages?'
  ]
};

const LANGUAGE_LABELS = {
  'en': 'English',
  'as': 'অসমীয়া (Assamese)',
  'bn': 'বাংলা (Bengali)',
  'hi': 'हिन्दी (Hindi)',
  'mni': 'মৈতৈলোন্ (Manipuri)',
  'lus': 'Mizo (Lushai)',
  'kha': 'Khasi',
  'grt': 'Garo (A·chik)',
  'trp': 'Kokborok (Tripura)'
};

const STRICT_REFUSAL_MESSAGE = "I am Bhumika, your AI Operations Commander. I can only assist you with the 4 core sections of PurvaSetu: Command Dashboard, Convoy Telematics (AIS-140), Route Intelligence, Hazard Simulation Studio, and Field Incident Report. How can I help you within these operations?";

export default function AIAssistantDrawer({ activeTab }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Namaste! I am **Bhumika**, your AI Operations Commander for **PurvaSetu**. I am here to guide you across our 4 core sections—Command Dashboard, Convoy Telematics (AIS-140), Route Intelligence, and Hazard Simulation Studio & Field Incident Report. How can I assist your mission today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Bhumika AI • Production Operations Commander'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  const currentSectionName = SECTION_NAMES[activeTab] || 'Command Dashboard';
  const currentPrompts = SUGGESTED_PROMPTS[activeTab] || SUGGESTED_PROMPTS['dashboard'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend || !textToSend.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const endpoints = ['/api/assistant/query', 'http://localhost:5000/api/assistant/query', 'http://localhost:5001/api/v1/ai/assistant/query'];
      let data = null;

      for (const ep of endpoints) {
        try {
          const response = await fetch(ep, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: textToSend.trim(),
              current_section: currentSectionName,
              preferred_language: LANGUAGE_LABELS[language] || language
            })
          });
          if (response.ok) {
            data = await response.json();
            if (data && (data.success || data.response)) break;
          }
        } catch (e) {
          // try next endpoint
        }
      }

      if (data && (data.response || data.text)) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'ai',
          text: data.response || data.text,
          source: data.source || 'Bhumika AI • Multilingual Operations Core',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('All endpoints unreachable');
      }
    } catch (err) {
      // Production-Grade Client Fallback with Strict Boundary Enforcement
      const q = textToSend.toLowerCase().trim();
      let responseText = '';

      // Off-topic refusal check
      if (/write|code|movie|song|cricket|recipe|love|joke|story|poem|president|prime minister/i.test(q)) {
        responseText = STRICT_REFUSAL_MESSAGE;
      } else if (/^(hi|hello|hey|namaste|namaskar|good morning|good evening|how are you|kemon acho|ki khobor|খুরুমজরি|নমস্কাৰ|নমস্কার|नमस्ते)/i.test(q)) {
        responseText = `Namaste! I am **Bhumika**, your AI Operations Commander for **PurvaSetu**.\n\nYou are currently viewing the **${currentSectionName}** section.\n\n**The 4 Core Operational Sections:**\n1. **Command Dashboard:** High-level executive summary & live regional metrics.\n2. **Convoy Telematics (AIS-140):** Real-time fleet tracking & dynamic bypass rerouting.\n3. **Route Intelligence:** Dual-routing (Fastest vs. Safest geotechnical corridor).\n4. **Hazard Simulation Studio & Field Incident Report:** Extreme weather stress-testing & offline SOS reports.\n\nHow can I help you within these operations?`;
      } else if (q.includes('all section') || q.includes('4 section') || q.includes('four section') || q.includes('overview') || q.includes('how does this app work') || q.includes('explain all')) {
        responseText = `**[PurvaSetu — The 4 Core Application Sections]**\n\n1️⃣ **Command Dashboard**\n* **What it is used for:** Provides a high-level executive summary of all 8 North-Eastern states, active disaster relief metrics, live TomTom traffic incidents, and overall regional operational status.\n* **How to use it:** Monitor summary metric cards for active convoys, view regional weather alerts, and track live infrastructure stability at a glance.\n\n2️⃣ **Convoy Telematics (AIS-140)**\n* **What it is used for:** Real-time tracking and telemetry monitoring of essential disaster relief and emergency supply convoys (POL fuel tankers, medical aid, and food grain lifelines) across state corridors.\n* **How to use it:** Use filter dropdowns to isolate commodity types (POL Tankers, Medical Aid, Food Grains), check live GPS coordinates, vehicle registration numbers, driver contacts, payload weights, and status chips (IN_TRANSIT, REROUTING, DELAYED_LANDSLIDE).\n\n3️⃣ **Route Intelligence**\n* **What it is used for:** Calculating dual-routing options (Fastest speed vs. Safest geotechnical disaster-resilient bypass) to steer vehicles safely around monsoons, landslides, and sinking zones.\n* **How to use it:** Select Origin State/City and Destination State/City, then click 'Analyze Strategic Corridors' to render alternative paths, distance, transit times, and risk scores on the map.\n\n4️⃣ **Hazard Simulation Studio & Field Incident Report**\n* **What it is used for:** Simulating extreme weather triggers (such as rainfall spikes via Open-Meteo) and logging or monitoring real-time field incident reports (like road closures, flooding, or mud accumulations).\n* **How to use it:** Input environmental variables or view live incident feeds to dynamically update graph edge weights and trigger automated emergency rerouting around blockages.`;
      } else if (q.includes('dashboard') || q.includes('section 1')) {
        responseText = `**[Section Guide: 1. Command Dashboard]**\n\n📌 **What it is used for:**\nProvides a high-level executive summary of all 8 North-Eastern states, active disaster relief metrics, live TomTom traffic incidents, and overall regional operational status.\n\n🛠️ **How to use it:**\nMonitor summary metric cards for active convoys, view regional weather alerts, and track live infrastructure stability at a glance.`;
      } else if (q.includes('telematics') || q.includes('convoy') || q.includes('section 2') || q.includes('truck') || q.includes('fleet')) {
        responseText = `**[Section Guide: 2. Convoy Telematics (AIS-140)]**\n\n📌 **What it is used for:**\nReal-time tracking and telemetry monitoring of essential disaster relief and emergency supply convoys (POL fuel tankers, medical aid, and food grain lifelines) across state corridors.\n\n🛠️ **How to use it:**\nUse filter dropdowns to isolate commodity types (POL Tankers, Medical Aid, Food Grains), check live GPS coordinates, vehicle registration numbers, driver contact details, payload weights, and current status chips (IN_TRANSIT, REROUTING, DELAYED_LANDSLIDE).`;
      } else if (q.includes('route') || q.includes('routing') || q.includes('fastest') || q.includes('safest') || q.includes('section 3')) {
        responseText = `**[Section Guide: 3. Route Intelligence]**\n\n📌 **What it is used for:**\nCalculating dual-routing options (Fastest speed vs. Safest geotechnical disaster-resilient bypass) to steer vehicles safely around monsoons, landslides, and sinking zones.\n\n🛠️ **How to use it:**\nSelect Origin State/City and Destination State/City, then click 'Analyze Strategic Corridors' to render alternative paths, distance, transit times, and risk scores on the map.`;
      } else if (q.includes('simulation') || q.includes('hazard') || q.includes('field report') || q.includes('incident') || q.includes('section 4')) {
        responseText = `**[Section Guide: 4. Hazard Simulation Studio & Field Incident Report]**\n\n📌 **What it is used for:**\nSimulating extreme weather triggers (such as rainfall spikes via Open-Meteo) and logging or monitoring real-time field incident reports (like road closures, flooding, or mud accumulations).\n\n🛠️ **How to use it:**\nInput environmental variables or view live incident feeds to dynamically update graph edge weights and trigger automated emergency rerouting around blockages.`;
      } else {
        responseText = STRICT_REFUSAL_MESSAGE;
      }

      const fallbackMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        source: 'Bhumika AI • Multilingual Operations Core',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <>
      {/* Floating Trigger Button - Pure Circular Avatar */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          title="Ask Bhumika AI — Operations Commander"
          aria-label="Ask Bhumika AI"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            width: '60px',
            height: '60px',
            padding: 0,
            backgroundColor: '#30483B',
            border: '2.5px solid #B8944A',
            borderRadius: '50%',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(48, 72, 59, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
          }}
        >
          <img
            src="/bhumika_avatar.jpg"
            alt="Bhumika AI"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          <span
            style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '13px',
              height: '13px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              border: '2px solid #EDE8DC',
              boxShadow: '0 0 8px #10B981'
            }}
          />
        </button>
      )}

      {/* Drawer Container */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: isExpanded ? '650px' : '420px',
            height: isExpanded ? '80vh' : '580px',
            maxHeight: '90vh',
            maxWidth: 'calc(100vw - 32px)',
            backgroundColor: '#EDE8DC',
            borderRadius: '20px',
            boxShadow: '0 16px 50px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(48, 72, 59, 0.2)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.3s ease, height 0.3s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: '#30483B',
              color: '#EDE8DC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src="/bhumika_avatar.jpg"
                  alt="Bhumika AI"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #B8944A'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '9px',
                  height: '9px',
                  backgroundColor: '#10B981',
                  borderRadius: '50%',
                  border: '1.5px solid #30483B'
                }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.96rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Bhumika AI Commander
                  <span style={{
                    fontSize: '0.66rem',
                    backgroundColor: 'rgba(184, 148, 74, 0.3)',
                    color: '#EDE8DC',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(184, 148, 74, 0.5)'
                  }}>
                    Gemini 2.5 Flash
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#CBD0C0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Radio size={12} color="#B8944A" />
                  Context: {currentSectionName}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#CBD0C0',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#CBD0C0',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Section & Language Context Bar */}
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#CBD0C0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: '#20231F',
              borderBottom: '1px solid rgba(32, 35, 31, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              <Languages size={14} color="#30483B" />
              <span>Language:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  backgroundColor: '#EDE8DC',
                  border: '1px solid rgba(48, 72, 59, 0.3)',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: '#20231F',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#30483B', fontWeight: 500 }}>
              <ShieldCheck size={14} />
              <span>ISRO & AIS-140 Live</span>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#EDE8DC'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '100%'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  maxWidth: '90%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  {msg.sender === 'ai' && (
                    <img
                      src="/bhumika_avatar.jpg"
                      alt="Bhumika"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid #B8944A',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    />
                  )}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      backgroundColor: msg.sender === 'user' ? '#30483B' : 'rgba(203, 208, 192, 0.75)',
                      color: msg.sender === 'user' ? '#EDE8DC' : '#20231F',
                      fontSize: '0.9rem',
                      lineHeight: '1.45',
                      letterSpacing: '-0.011em',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: msg.sender === 'user' ? 'none' : '1px solid rgba(48, 72, 59, 0.15)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {msg.text}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '4px',
                    marginLeft: msg.sender === 'ai' ? '36px' : '0',
                    fontSize: '0.72rem',
                    color: '#4A5048',
                    padding: '0 4px'
                  }}
                >
                  <span>{msg.timestamp}</span>
                  {msg.source && (
                    <span style={{ opacity: 0.8 }}>• {msg.source}</span>
                  )}
                  {msg.sender === 'ai' && (
                    <>
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#30483B',
                          padding: '2px',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                      <button
                        onClick={() => speakText(msg.text)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: isSpeaking ? '#A9573F' : '#30483B',
                          padding: '2px',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                        title="Read aloud"
                      >
                        {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4A5048', fontSize: '0.85rem' }}>
                <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generating multilingual operations guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context Prompt Suggestions */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: '#CBD0C0',
              borderTop: '1px solid rgba(32, 35, 31, 0.08)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {currentPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                style={{
                  backgroundColor: '#EDE8DC',
                  border: '1px solid rgba(48, 72, 59, 0.2)',
                  borderRadius: '12px',
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  color: '#30483B',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  flexShrink: 0,
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EDE8DC'}
              >
                <Sparkles size={11} color="#B8944A" />
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#EDE8DC',
              borderTop: '1px solid rgba(32, 35, 31, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              type="text"
              placeholder={`Ask in ${LANGUAGE_LABELS[language] || 'any language'} about ${currentSectionName}...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid rgba(32, 35, 31, 0.2)',
                backgroundColor: '#FFFFFF',
                color: '#20231F',
                fontSize: '0.9rem',
                outline: 'none',
                letterSpacing: '-0.011em'
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputQuery.trim()}
              style={{
                backgroundColor: inputQuery.trim() ? '#30483B' : '#CBD0C0',
                color: '#EDE8DC',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 14px',
                cursor: inputQuery.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
