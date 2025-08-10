# FoodScout — Restaurant & Menu Price Compare

A simple static website that lists restaurants and their menus with local prices, and compares them with Zomato and Swiggy. Includes location buttons and category filters.

## Quickstart

- Open `index.html` directly in your browser, or serve the folder with a static server:

```bash
python3 -m http.server 8080 --directory /workspace/restaurant-compare
```

Then open `http://localhost:8080`.

## Features

- Navigation: Home, Category, Foods, Restros, Contact Us
- Home: Famous restros and foods, contact highlight
- Restros: Cards with image, rating, open menu modal, and location button
- Foods: Cards with compare (modal), location, and see more
- Category: Chips to filter by cuisine or category
- Contact: Simple non-functional form (demo)

## Data

- Edit `data/restaurants.json` to add restaurants and their menus. Prices for Zomato and Swiggy are mock/demo placeholders.

## Notes

- This is a demo/static project. No backend is included.
- External images are loaded from Unsplash. Replace with your own assets if needed.