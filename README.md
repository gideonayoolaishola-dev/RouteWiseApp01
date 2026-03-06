# RouteWise - Smart Route Planning for Nigeria

A modern, colorful dark-themed web application for finding optimal transportation routes across Nigeria with real-time traffic data, cost estimation, and multiple transport modes.

## Features

- 🚗 **Multiple Transport Modes**: Car, Bus, Bike, and Walking
- 🗺️ **Real-time Maps**: Integrated with OpenStreetMap and Leaflet
- 🚦 **Traffic Awareness**: Smart traffic detection based on time of day
- 💰 **Cost Estimation**: Intelligent pricing for each transport mode
- 📍 **Route Planning**: Turn-by-turn directions with distance calculations
- 🌙 **Dark Theme**: Modern dark interface with colorful accents
- 🇳🇬 **Nigeria-Optimized**: Pre-configured with major Nigerian cities

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/routewise-app.git
   cd routewise-app
   ```

2. **Open in browser**:
   - Simply open `index.html` in your web browser
   - No installation or build process required

## How to Use

1. Select your preferred **Transport Mode** (Car, Bus, Bike, or Walk)
2. Enter your **Starting Point** and **Destination**
   - Use autocomplete for major Nigerian cities
   - Or enter custom locations
3. Set your **Preferences** (avoid tolls, highways, etc.)
4. Click **Find Route** to see the optimal path
5. Review the route details including distance, duration, cost, and traffic status

## Supported Nigerian Cities

- Lagos, Abuja, Ibadan, Kano, Port Harcourt
- Enugu, Benin City, Owerri, Calabar, Jos
- Akure, Sokoto, Ilorin, Maiduguri, Gusau
- Lokoja, Warri, Asaba, Makurdi, Lafia
- And many more...

## Technology Stack

- **Frontend**: Vanilla JavaScript, Tailwind CSS
- **Mapping**: Leaflet.js with OpenStreetMap tiles
- **Routing**: OSRM (Open Source Routing Machine)
- **Geocoding**: OpenStreetMap Nominatim

## Cost Estimation

Rates per kilometer:
- **Car**: ₦150/km (minimum ₦500)
- **Bus**: ₦50/km (minimum ₦200)
- **Bike**: ₦30/km (minimum ₦100)
- **Walking**: Free

## Traffic Simulation

- **Rush Hours** (6-9 AM, 4-7 PM): Heavy traffic 🔴
- **Midday** (10 AM-3 PM): Light traffic 🟢
- **Other Times**: Moderate traffic 🟡

## API Integration

This app uses free, open-source APIs:
- **OpenStreetMap**: Map tiles and geocoding
- **OSRM**: Route calculation and navigation
- **Leaflet**: Interactive map interface

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT License - Feel free to use and modify

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## Future Enhancements

- Real-time traffic API integration
- Multi-stop route planning
- Route history and saved favorites
- Alternative route comparison
- Public transportation schedules
- Vehicle fuel/battery optimization
- Share route functionality

## Support

For issues or suggestions, please create an issue on GitHub.

---

Made with ❤️ for Nigeria's transportation needs