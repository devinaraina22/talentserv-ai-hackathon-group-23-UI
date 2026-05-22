# PatientBookingAI

An AI-powered patient appointment booking system that lets patients schedule medical visits through natural language conversation.

## Overview

PatientBookingAI is designed to help patients book appointments without navigating complex forms or phone menus. Users describe what they need in plain language; the system understands intent, checks availability, and confirms bookings.

## Features

- **Natural language booking** — Schedule appointments by describing date, time, provider, or reason for visit
- **Availability lookup** — Query open slots and suggest alternatives when preferred times are unavailable
- **Conversational interface** — Patient-friendly dialogue instead of rigid multi-step forms
- **Appointment confirmation** — Summarize and confirm details before finalizing

## Tech Stack (planned)

| Layer        | Options                          |
| ------------ | -------------------------------- |
| Runtime      | Node.js 18+ or Python 3.11+      |
| LLM          | OpenAI, Anthropic, or local model |
| API          | REST or WebSocket for chat       |
| Scheduling   | Calendar integration (TBD)       |

## Getting Started

### Prerequisites

- Node.js 18+ **or** Python 3.11+
- An API key for your chosen LLM provider

### Setup

```bash
git clone <repository-url>
cd PatientBookingAI
```

Once the project scaffold is added:

```bash
# Node.js
npm install
cp .env.example .env   # then add your API keys

# Python
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

### Environment variables

Create a `.env` file in the project root:

```env
# LLM provider (example)
OPENAI_API_KEY=your_key_here

# Optional: scheduling backend
# CALENDAR_API_URL=
# CALENDAR_API_KEY=
```

### Run

Commands will be documented here once the application entry point is added (e.g. `npm start` or `python -m patient_booking_ai`).

## Project structure

```
PatientBookingAI/
├── README.md
└── (application code — coming soon)
```

## Roadmap

- [ ] Core chat / booking agent
- [ ] Availability and slot management
- [ ] Appointment confirmation and reminders
- [ ] Provider or clinic configuration
- [ ] Tests and deployment docs

## Contributing

Contributions are welcome. Open an issue or pull request to discuss changes.

## License

MIT
