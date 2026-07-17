<h1 align="center">🤼 Mat Metrics</h1>

<p align="center"><b><strong>An Interactive Explorer For NCAA Division 1 Wrestling Championship Results</strong></p>

## Features
 
### All Athletes
- Browse All 1,152+ Placers
- Advanced Filtering
- Multi-Column Sorting
- Pagination
- Real-Time Search
### Results by Year
- Tournament-By-Tournament View
- Organized By Weight Class
- Placement Badges
- Year-At-A-Glance Stats
- Quick-Select Tabs
### Visualizations
- Top States By Placers
- Champion Leaders
- State Points Over Time
- Weight Class Coverage
- Placement Distribution
- Multi-Year Placers

## Setup

### 1. Clone The Repository

```bash
git clone https://github.com/aneeshsudigala/Mat-Metrics
cd Mat-Metrics
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run The App

```bash
npm run dev
```

## File Structure

```
mat-metrics/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── ncaa_data.csv
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AthletesView.tsx
│   │   ├── VisualizationsView.tsx
│   │   └── YearView.tsx
│   ├── data/
│   │   ├── WrestlingDataContext.tsx
│   │   └── wrestlingData.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .gitignore
```
