"""
NER Sentinel AI - Bhumika: Production-Grade AI Operations Commander
Engineered with strict operational boundaries, 4-section architecture knowledge,
live convoy telematics lookup, and multilingual support for English, Hindi, and 7 NE regional languages.
"""

import os
import re
import json
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger("BhumikaCommander")

# Try importing google.genai
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

STRICT_REFUSAL_MESSAGE = (
    "I am Bhumika, your AI Operations Commander. I can only assist you with the 4 core sections "
    "of NER Sentinel AI: Command Dashboard, Convoy Telematics (AIS-140), Route Intelligence, "
    "Hazard Simulation Studio, and Field Incident Report. How can I help you within these operations?"
)

class BhumikaOperationsCopilot:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.client = None
        self._init_client()

    def _init_client(self):
        if HAS_GENAI and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("[BhumikaCommander] Google GenAI client initialized with gemini-2.5-flash.")
            except Exception as e:
                logger.warning(f"[BhumikaCommander] GenAI init note: {e}")
                self.client = None
        else:
            self.client = None

    def _detect_language(self, preferred_language: str, text: str) -> str:
        """Detects language code from user preference or query script."""
        p_lower = (preferred_language or "").lower()
        t_lower = (text or "").lower()

        if any(w in p_lower for w in ["assam", "অসমী"]): return "as"
        if any(w in p_lower for w in ["bengal", "বাংলা"]): return "bn"
        if any(w in p_lower for w in ["hind", "हिन्दी", "hindi"]): return "hi"
        if any(w in p_lower for w in ["manip", "meitei", "মৈতৈ"]): return "mni"
        if any(w in p_lower for w in ["mizo", "lushai"]): return "lus"
        if any(w in p_lower for w in ["khas"]): return "kha"
        if any(w in p_lower for w in ["garo"]): return "grt"
        if any(w in p_lower for w in ["tripura", "kokborok"]): return "trp"

        # Check script characters in query
        if re.search(r'[\u0980-\u09FF]', text):
            if any(w in t_lower for w in ["অসম", "নমস্কাৰ", "আপুনি", "কেনে", "পথ", "কি"]):
                return "as"
            return "bn"
        if re.search(r'[\u0900-\u097F]', text):
            return "hi"
        if re.search(r'[\uABC0-\uABFF]', text):
            return "mni"

        return "en"

    def _get_convoy_info(self, query: str) -> Optional[Dict[str, Any]]:
        """Searches for convoy match in registry."""
        try:
            from convoy_tracker import CONVOY_REGISTRY
            q_clean = query.upper().replace(" ", "").replace("-", "")
            for c in CONVOY_REGISTRY:
                reg_clean = c.get("vehicle_reg_no", "").upper().replace(" ", "").replace("-", "")
                c_id_clean = c.get("convoy_id", "").upper().replace(" ", "").replace("-", "")
                if reg_clean in q_clean or c_id_clean in q_clean or (len(reg_clean) > 4 and reg_clean in q_clean):
                    return c
                if any(k in q_clean for k in ["POL", "FUEL", "DIESEL"]) and c.get("commodity_type") == "POL_TANKER":
                    return c
                if any(k in q_clean for k in ["MEDICAL", "OXYGEN", "PLASMA", "TRAUMA"]) and c.get("commodity_type") == "MEDICAL_AID":
                    return c
                if any(k in q_clean for k in ["FCI", "GRAIN", "RICE", "WHEAT"]) and c.get("commodity_type") == "FOOD_GRAINS":
                    return c
        except Exception:
            pass
        return None

    def query(self, user_query: str, current_section: str = "Dashboard", preferred_language: str = "English") -> Dict[str, Any]:
        """
        Executes an intelligent contextual query with strict boundary enforcement,
        real-time telemetry lookup, and full multilingual output.
        """
        if not user_query or not user_query.strip():
            return {"success": False, "error": "Query cannot be empty."}

        clean_query = user_query.strip()
        lang_code = self._detect_language(preferred_language, clean_query)

        # 1. If Gemini client is active, execute LLM inference with strict directives
        if self.client:
            try:
                system_instruction = f"""
Role & Strict Behavioral Directives:
You are "Bhumika", the production-grade AI Operations Commander for **NER Sentinel AI**. Your sole purpose is to assist command-center operators by explaining the 4 application sections, guiding them on their usage, tracking supply convoys, and providing route/disaster intelligence across the 8 North-Eastern states.

STRICT BOUNDARY ENFORCEMENT:
- You are strictly restricted to answering questions related to the application's 4 core sections, fleet tracking, route guidance, and disaster alerts.
- If a user asks about anything outside these operational scopes (e.g., general trivia, coding help, personal advice, unrelated topics), you MUST refuse politely using this exact stance: 
  "{STRICT_REFUSAL_MESSAGE}"
- Never hallucinate features or break character.

---

THE 4 CORE APPLICATION SECTIONS (Your Knowledge Base):

1. Command Dashboard
   - What it is used for: Provides a high-level executive summary of all 8 North-Eastern states, active disaster relief metrics, live TomTom traffic incidents, and overall regional operational status.
   - How to use it: Monitor summary metric cards for active convoys, view regional weather alerts, and track live infrastructure stability at a glance.

2. Convoy Telematics (AIS-140)
   - What it is used for: Real-time tracking and telemetry monitoring of essential disaster relief and emergency supply convoys (POL fuel tankers, medical aid, and food grain lifelines) across state corridors.
   - How to use it: Use the filter dropdowns to isolate commodity types (POL Tankers, Medical Aid, Food Grains), check live GPS coordinates, vehicle registration numbers, driver contact details, payload weights, and current status chips (IN_TRANSIT, REROUTING, DELAYED_LANDSLIDE).

3. Route Intelligence
   - What it is used for: Calculating dual-routing options (Fastest speed vs. Safest geotechnical disaster-resilient bypass) to steer vehicles safely around monsoons, landslides, and sinking zones.
   - How to use it: Select Origin State/City and Destination State/City, then click 'Analyze Strategic Corridors' to render alternative paths, distance, transit times, and risk scores on the map.

4. Hazard Simulation Studio & Field Incident Report
   - What it is used for: Simulating extreme weather triggers (such as rainfall spikes via Open-Meteo) and logging or monitoring real-time field incident reports (like road closures, flooding, or mud accumulations).
   - How to use it: Input environmental variables or view live incident feeds to dynamically update graph edge weights and trigger automated emergency rerouting around blockages.

---

Language & Communication Protocol:
- Respond fluently in the user's preferred language: {preferred_language}.
- Supported languages include: English, Hindi, and the primary regional languages of the 7 North-Eastern states and Sikkim (Assamese, Bengali, Manipuri, Khasi, Garo, Mizo, Kokborok).
- If technical terms (e.g., "POL Tanker", "NetworkX Graph", "Bounding Box", "AIS-140 GPS") lack direct local equivalents, provide the native translation followed by the English term in brackets.
- Anchor corridor IDs (e.g., NH-6, NH-37, NH-10, NH-13) and vehicle registration numbers (e.g., ML-05-T-8821, AS-01-GC-4912) cleanly in English alphanumeric notation.
- If the user sends a simple greeting (like 'hi', 'hello', 'namaste'), reply warmly as Bhumika, and briefly offer help on the 4 sections or live tracking.
- Keep replies structured, concise, operational, and free of introductory fluff.

Current Active Panel viewed by user: {current_section}.
"""
                response = self.client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=clean_query,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.2,
                    ),
                )
                if response and response.text:
                    return {
                        "success": True,
                        "source": "Bhumika AI • Gemini 2.5 Flash Core",
                        "language": preferred_language,
                        "current_section": current_section,
                        "response": response.text.strip()
                    }
            except Exception as e:
                logger.warning(f"[BhumikaCommander] GenAI execution fallback: {e}")

        # 2. Production-Grade Boundary-Enforced NLU & State Engine (Offline Resilient)
        response_text = self._generate_intelligent_response(clean_query, current_section, lang_code)
        
        return {
            "success": True,
            "source": "Bhumika AI • Multilingual Operations Core",
            "language": preferred_language,
            "current_section": current_section,
            "response": response_text
        }

    def _generate_intelligent_response(self, query: str, section: str, lang: str) -> str:
        """Processes intent, enforces boundary rules, and delivers structured operational replies."""
        q = query.lower().strip()
        word_count = len(q.split())

        # =========================================================================
        # 1. STRICT OFF-TOPIC BOUNDARY CHECK
        # =========================================================================
        off_topic_patterns = [
            r"\b(write|generate|create)\s+(code|script|program|python|javascript|c\+\+|java|html|css|game|app)\b",
            r"\b(movie|film|actor|actress|song|singer|music|cricket|football|celebrity|joke|recipe|cooking)\b",
            r"\b(love|girlfriend|boyfriend|relationship|dating|marry|marriage|horoscope|astrology)\b",
            r"\b(capital of|who is the president|who is the prime minister|who won)\b",
            r"\b(solve math|calculate equation|write an essay|write a poem|write a story)\b"
        ]
        for pattern in off_topic_patterns:
            if re.search(pattern, q):
                return STRICT_REFUSAL_MESSAGE

        # =========================================================================
        # 2. SPECIFIC CONVOY TELEMATICS LOOKUP
        # =========================================================================
        convoy = self._get_convoy_info(query)
        if convoy:
            c_id = convoy.get("convoy_id")
            v_reg = convoy.get("vehicle_reg_no")
            c_name = convoy.get("name")
            c_type = convoy.get("commodity_type")
            c_desc = convoy.get("payload_description")
            c_origin = convoy.get("origin")
            c_dest = convoy.get("destination")
            c_loc = convoy.get("current_location_name")
            c_speed = convoy.get("speed_kmh")
            c_status = convoy.get("status")
            c_hazard = convoy.get("hazard_flag")
            c_driver = convoy.get("driver_name")
            c_contact = convoy.get("driver_contact")

            return f"""**[Telematics Dispatch Report: {c_id} ({v_reg})]**

🚛 **Fleet:** {c_name}
📦 **Payload:** {c_desc} (Commodity: `{c_type}`)
📍 **Location:** {c_loc}
🛣️ **Route:** {c_origin} → {c_dest} (Speed: {c_speed} km/h)
📊 **Status:** `{c_status}`
⚠️ **Active Alert:** {c_hazard}
👤 **Driver:** {c_driver} ({c_contact})

**Operational Guidance:**
Navigate to **Convoy Telematics (AIS-140)**, select `{v_reg}`, and click **'Execute A* Bypass Reroute'** to steer away from the affected corridor."""

        # =========================================================================
        # 3. GREETINGS & PLEASANTRIES (Short queries: <= 5 words)
        # =========================================================================
        greeting_words = ["hi", "hello", "hey", "namaste", "namaskar", "nomoskar", "khublei", "chibai", "khurumjari", "good morning", "good evening", "how are you", "kemon acho", "ki khobor", "kaise ho", "নমস্কাৰ", "নমস্কার", "नमस्ते", "খুরুমজরি"]
        if word_count <= 5 and any(w in q for w in greeting_words):
            greetings = {
                "en": f"""Namaste! I am **Bhumika**, your AI Operations Commander for **NER Sentinel AI**.

I am standing by to assist you. You are currently viewing the **{section}** section.

**Operational Capabilities:**
1. **Command Dashboard:** Executive summary & live metrics across all 8 North-Eastern states.
2. **Convoy Telematics (AIS-140):** Real-time GPS fleet tracking (POL, Medical, Food Grains) & emergency rerouting.
3. **Route Intelligence:** Dual-routing (Fastest vs. Safest geotechnical bypass).
4. **Hazard Simulation Studio & Field Incident Report:** Weather stress-testing & offline SOS reporting.

How can I assist your mission within these 4 sections?""",

                "as": f"""নমস্কাৰ! মই **ভূমিকা (Bhumika)**, **NER Sentinel AI**-ৰ আপোনাৰ AI অপাৰেচন কমাণ্ডাৰ।

মই আপোনাক সহায় কৰিবলৈ সাজু। আপুনি এতিয়া **{section}** পেনেল চাই আছে।

**মই ৪টা মূল বিভাগত সহায় কৰিব পাৰো:**
১. **Command Dashboard:** ৮খন ৰাজ্যৰ সামগ্ৰিক স্থিতি আৰু লাইভ দুৰ্যোগ এলাৰ্ট।
২. **Convoy Telematics (AIS-140):** জৰুৰীকালীন কনভয় ট্ৰেকিং আৰু ৰিৰুটিং।
৩. **Route Intelligence:** সুৰক্ষিত আৰু দ্ৰুততম দ্বৈত পথ নিৰ্ধাৰণ।
৪. **Hazard Simulation & Field Report:** বতৰ সিমুলেচন আৰু অফলাইন ঘটনা প্ৰতিবেদন।

মই আপোনাক কিদৰে সহায় কৰিব পাৰো?""",

                "bn": f"""নমস্কার! আমি **ভূমিকা (Bhumika)**, **NER Sentinel AI**-এর আপনার এআই অপারেশনস কমান্ডার।

আমি আপনাকে সহায়তা করতে প্রস্তুত। আপনি বর্তমানে **{section}** সেকশন দেখছেন।

**আমি ৪টি মূল বিষয়ে সহায়তা করতে পারি:**
১. **Command Dashboard:** ৮টি উত্তর-পূর্ব রাজ্যের সামগ্রিক অবস্থা ও লাইভ ট্রাফিক ইনসিডেন্ট।
২. **Convoy Telematics (AIS-140):** জরুরি কনভয় ট্র্যাকিং (POL, চিকিৎসা ত্রাণ, খাদ্য)।
৩. **Route Intelligence:** দ্রুততম ও নিরাপদ জিওটেকনিক্যাল রুট গণনা।
৪. **Hazard Simulation & Field Report:** চরম আবহাওয়া সিমুলেশন ও অফলাইন SOS রিপোর্ট।

কীভাবে সাহায্য করতে পারি?""",

                "hi": f"""नमस्ते! मैं **भूमिका (Bhumika)** हूँ, **NER Sentinel AI** की आपकी AI ऑपरेशंस कमांडर।

मैं आपकी सहायता के लिए तैयार हूँ। आप वर्तमान में **{section}** सेक्शन देख रहे हैं।

**मैं निम्नलिखित 4 प्रमुख सेक्शन्स में मदद कर सकती हूँ:**
1. **Command Dashboard:** सभी 8 पूर्वोत्तर राज्यों की समग्र स्थिति और लाइव मेट्रिक्स।
2. **Convoy Telematics (AIS-140):** आवश्यक आपूर्ति काफिलों (POL, चिकित्सा सहायता, खाद्यान्न) की रियल-टाइम ट्रैकिंग।
3. **Route Intelligence:** सबसे तेज़ बनाम सबसे सुरक्षित भू-तकनीकी मार्ग विश्लेषण।
4. **Hazard Simulation & Field Report:** मौसम सिमुलेशन और ऑफलाइन फील्ड इंसीडेंट रिपोर्टिंग।

मैं आपकी क्या सहायता कर सकती हूँ?"""
            }
            return greetings.get(lang, greetings["en"])

        # =========================================================================
        # 4. EXPLAIN ALL 4 CORE SECTIONS
        # =========================================================================
        if any(w in q for w in ["all section", "all 4", "4 section", "4 core", "four section", "four core", "explain section", "explain app", "what is this app", "how to use app", "overview", "core section", "sections", "architecture", "সকল সেকশন", "সব সেকশন", "সকল বিভাগ", "সকল ৪টা", "সকল ৪টি", "সকল ৪", "सभी सेक्शन", "चारों सेक्शन"]):
            return """**[NER Sentinel AI — The 4 Core Application Sections]**

---

### 1️⃣ Command Dashboard
* **What it is used for:** Provides a high-level executive summary of all 8 North-Eastern states, active disaster relief metrics, live TomTom traffic incidents, and overall regional operational status.
* **How to use it:** Monitor summary metric cards for active convoys, view regional weather alerts, and track live infrastructure stability at a glance.

---

### 2️⃣ Convoy Telematics (AIS-140)
* **What it is used for:** Real-time tracking and telemetry monitoring of essential disaster relief and emergency supply convoys (POL fuel tankers, medical aid, and food grain lifelines) across state corridors.
* **How to use it:** Use the filter dropdowns to isolate commodity types (POL Tankers, Medical Aid, Food Grains), check live GPS coordinates, vehicle registration numbers, driver contact details, payload weights, and current status chips (IN_TRANSIT, REROUTING, DELAYED_LANDSLIDE).

---

### 3️⃣ Route Intelligence
* **What it is used for:** Calculating dual-routing options (Fastest speed vs. Safest geotechnical disaster-resilient bypass) to steer vehicles safely around monsoons, landslides, and sinking zones.
* **How to use it:** Select Origin State/City and Destination State/City, then click 'Analyze Strategic Corridors' to render alternative paths, distance, transit times, and risk scores on the map.

---

### 4️⃣ Hazard Simulation Studio & Field Incident Report
* **What it is used for:** Simulating extreme weather triggers (such as rainfall spikes via Open-Meteo) and logging or monitoring real-time field incident reports (like road closures, flooding, or mud accumulations).
* **How to use it:** Input environmental variables or view live incident feeds to dynamically update graph edge weights and trigger automated emergency rerouting around blockages.

---
💡 *Ask me for detailed instructions on any specific section or convoy tracking!*"""

        # =========================================================================
        # 5. SECTION 1: COMMAND DASHBOARD
        # =========================================================================
        if any(w in q for w in ["dashboard", "command dashboard", "section 1", "first section"]):
            return """**[Section Guide: 1. Command Dashboard]**

📌 **What it is used for:**
Provides a high-level executive summary of all 8 North-Eastern states, active disaster relief metrics, live TomTom traffic incidents, and overall regional operational status.

🛠️ **How to use it:**
1. **Metric Oversight:** Monitor summary metric cards for active convoys, transit delays, and relief supply statuses.
2. **Weather & Incident Feeds:** View regional weather alerts and live TomTom traffic incident overlays.
3. **Infrastructure Stability:** Track live infrastructure stability and road network health across state corridors at a glance."""

        # =========================================================================
        # 6. SECTION 2: CONVOY TELEMATICS (AIS-140)
        # =========================================================================
        if any(w in q for w in ["convoy", "telematics", "ais-140", "section 2", "fleet", "truck", "tanker"]):
            return """**[Section Guide: 2. Convoy Telematics (AIS-140)]**

📌 **What it is used for:**
Real-time tracking and telemetry monitoring of essential disaster relief and emergency supply convoys (POL fuel tankers, medical aid, and food grain lifelines) across state corridors.

🛠️ **How to use it:**
1. **Isolate Commodities:** Use the filter dropdowns to isolate commodity types (POL Tankers, Medical Aid, Food Grains).
2. **Review Telemetry:** Check live GPS coordinates, vehicle registration numbers (e.g. `ML-05-T-8821`, `AS-01-GC-4912`), driver contact details, payload weights, and current status chips (`IN_TRANSIT`, `REROUTING`, `DELAYED_LANDSLIDE`).
3. **Trigger Rerouting:** Click **'Execute A* Bypass Reroute'** on affected convoys to steer them around blocked highway segments."""

        # =========================================================================
        # 7. SECTION 3: ROUTE INTELLIGENCE
        # =========================================================================
        if any(w in q for w in ["route intelligence", "routing", "section 3", "fastest", "safest", "dual-routing", "corridor"]):
            return """**[Section Guide: 3. Route Intelligence]**

📌 **What it is used for:**
Calculating dual-routing options (Fastest speed vs. Safest geotechnical disaster-resilient bypass) to steer vehicles safely around monsoons, landslides, and sinking zones.

🛣️ **The Dual-Corridors:**
* ⚡ **Fastest Route:** Shortest travel time along major national corridors cross-checked with ISRO Bhuvan geoportal geometry.
* 🛡️ **Safest Route:** Geotechnical A* algorithm that steers around steep landslide slopes (>15°) and flood zones.

🛠️ **How to use it:**
1. Select **Origin State & City** and **Destination State & City**.
2. Click **'Analyze Strategic Corridors'** to render alternative paths, distance, transit times, and risk scores on the map."""

        # =========================================================================
        # 8. SECTION 4: HAZARD SIMULATION STUDIO & FIELD INCIDENT REPORT
        # =========================================================================
        if any(w in q for w in ["simulation", "hazard", "field report", "incident report", "sos", "section 4", "offline"]):
            return """**[Section Guide: 4. Hazard Simulation Studio & Field Incident Report]**

📌 **What it is used for:**
Simulating extreme weather triggers (such as rainfall spikes via Open-Meteo) and logging or monitoring real-time field incident reports (like road closures, flooding, or mud accumulations).

🛠️ **How to use it:**
1. **Run Hazard Simulation:** Select a mountain corridor, adjust environmental variables (Precipitation 0-300mm, Soil Moisture 0.1-0.6, Jam Factor 0-10), and click **'Run AI Hazard Simulation'** to predict road blockage risks.
2. **Field Incident Reports:** Log crowdsourced road incidents (works 100% offline with automatic sync once reconnected).
3. **Automated Rerouting:** Live incident feeds dynamically update graph edge weights and trigger automated emergency rerouting around blockages."""

        # =========================================================================
        # 9. DEFAULT / CONTEXTUAL FALLBACK
        # =========================================================================
        # If query contains any keywords related to routes, landslides, weather, convoys, or states:
        if any(w in q for w in ["assam", "meghalaya", "arunachal", "manipur", "mizoram", "nagaland", "tripura", "sikkim", "nh-6", "nh-37", "sela", "sonapur", "weather", "landslide", "flood", "fuel", "diesel", "oxygen"]):
            return f"""**[NER Sentinel AI Operations Guidance]**

Regarding your query: **"{query}"**

You can evaluate this directly within the platform:
* **Command Dashboard:** Check regional disaster alerts and corridor statuses.
* **Convoy Telematics (AIS-140):** Monitor active supply fleets and execute bypass reroutes.
* **Route Intelligence:** Compute dual Fastest vs. Safest corridors.
* **Hazard Simulation Studio & Field Incident Report:** Test weather severity impacts and log field blockages.

Let me know if you would like me to explain how to use any of these sections!"""

        # Off-topic fallback refusal for completely unknown non-operational queries
        return STRICT_REFUSAL_MESSAGE

# Singleton instance
assistant_engine = BhumikaOperationsCopilot()

