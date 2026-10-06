import './App.css'
import Header from './components/Header'

function App() {
  return (
    <div className="container">
      <Header />

      <main>
        <h1>Відкрий Карпати</h1>
        <p>Обери свою наступну вершину.</p>
        <a href="#peaks" className="btn-link">
          Переглянути вершини
        </a>

        <h2>Вершини</h2>
        <p>Маршрути та мандрівки горами.</p>

        <h2>Про нас</h2>
        <p>Допомагаємо планувати подорожі Карпатами.</p>
      </main>
    </div>
  )
}

export default App
