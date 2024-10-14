import { useCallback, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [fruits, setFruits] = useState([
    { id: 1, name: 'Apple', color: 'Red', taste: 'Sweet' },
    { id: 2, name: 'Banana', color: 'Yellow', taste: 'Sweet' },
    { id: 3, name: 'Orange', color: 'Orange', taste: 'Citrusy' },
    { id: 4, name: 'Strawberry', color: 'Red', taste: 'Sweet' },
    { id: 5, name: 'Lemon', color: 'Yellow', taste: 'Sour' },
  ]);

  const handleRemoveFruit = useCallback((event) => {
    const fruitId = parseInt(event.target.dataset.fruitId);
    setFruits((prev) => prev.filter(fruit => fruit.id !== fruitId));
  }, []);

  return (
    <div>
      <h2>Fruit List</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Color</th>
            <th>Taste</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fruits.map((fruit) => (
            <tr key={fruit.id}>
              <td>{fruit.id}</td>
              <td>{fruit.name}</td>
              <td>{fruit.color}</td>
              <td>{fruit.taste}</td>
              <td>
                <button 
                  onClick={handleRemoveFruit} 
                  data-fruit-id={fruit.id}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App
