# 🚀 Quick Start Guide - Movie Recommendation System

## 📋 Prerequisites

- Python 3.8 or higher
- pip package manager
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🔧 Installation & Setup

### Step 1: Install Dependencies

```bash
# Install required Python packages
pip install -r requirements.txt
```

### Step 2: Verify Files

Make sure you have these files in your project directory:

- `app.py` - Flask backend server
- `dbscan_movie_recommendation_model.pkl` - Trained model
- `movie_recommendation_dbscan.csv` - Movie dataset
- `frontend/` folder with HTML, CSS, and JS files

### Step 3: Run the Application

```bash
# Start the Flask server
python app.py
```

You should see output like:

```
🎬 Starting Movie Recommendation System...
==================================================
✅ DBSCAN model loaded successfully
✅ Movies dataset loaded: 8000 movies
==================================================
✅ All components loaded successfully!
🌐 Server running at: http://localhost:5000
```

### Step 4: Access the Frontend

Open your web browser and navigate to:

```
http://localhost:5000
```

## 🎯 How to Use

1. **Search for a Movie**

   - Type a movie name in the search box (e.g., "The Matrix")
   - Click the search button or press Enter

2. **View Recommendations**

   - The system will display 5 similar movies
   - Each card shows: Title, Year, Genre, and Rating

3. **Try Popular Searches**
   - Click on any suggestion chip for quick searches
   - Examples: "Inception", "The Hangover", "The Conjuring"

## 🔌 API Endpoints

### Get Recommendations

```bash
POST http://localhost:5000/api/recommend
Content-Type: application/json

{
    "movie_name": "The Matrix",
    "n_recommendations": 5
}
```

### Health Check

```bash
GET http://localhost:5000/api/health
```

### System Statistics

```bash
GET http://localhost:5000/api/stats
```

### Search Movies

```bash
GET http://localhost:5000/api/movies/search?q=matrix&limit=10
```

## 🐛 Troubleshooting

### Issue: "Model not loaded"

**Solution:** Make sure these files exist:

- `dbscan_movie_recommendation_model.pkl`
- `movie_recommendation_dbscan.csv`

### Issue: "Port 5000 already in use"

**Solution:** Change the port in `app.py`:

```python
app.run(debug=True, host='0.0.0.0', port=8080)
```

### Issue: CORS errors

**Solution:** Make sure `flask-cors` is installed:

```bash
pip install flask-cors
```

## 📱 Features

✅ Interactive UI with animations
✅ Responsive design (mobile-friendly)
✅ Real-time search suggestions
✅ Autocomplete functionality
✅ Beautiful gradient backgrounds
✅ Particle effects
✅ Smooth scrolling
✅ Statistics dashboard

## 🌐 Deployment

### Deploy to Heroku

```bash
# Create Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
heroku create your-app-name
git push heroku main
```

### Deploy to Vercel/Netlify

The frontend can be deployed as a static site with API routes proxied to your backend.

## 💡 Tips

- Use Chrome DevTools to see console animations
- Try different movie genres for varied recommendations
- The system works best with popular movies
- Hover over cards for cool animations

## 📞 Support

For issues or questions:

- GitHub: @itsluckysharma01
- Email: your.email@example.com

## 🎉 Enjoy!

Your Movie Recommendation System is now ready to use!
Happy movie discovering! 🍿
