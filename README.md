### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd currency-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Currency Beacon API key:
   ```
   VITE_CURRENCY_API_KEY=your_api_key_here
   VITE_CURRENCY_API_BASE_URL=https://api.currencybeacon.com/v1
   ```

4. **Get your API key**
   - Visit [Currency Beacon](https://currencybeacon.com/register)
   - Register for a free account
   - Copy your API key from the dashboard
   - Paste it in your `.env` file

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`