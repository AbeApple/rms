import logo from './logo.svg';
import './App.css';
import Calendar from './Features/Calendar/Calendar';
import SettingsWindow from './Features/Windows/SettingsWindow';

function App() {
  return (
    <div className="App">
      <Calendar></Calendar>
      <SettingsWindow />
    </div>
  );
}

export default App;
