import './App.css';
import Calendar from './Features/Calendar/Calendar';
import SettingsWindow from './Features/Windows/SettingsWindow';
import EventsLoader from './Features/Events/EventsLoader';
import EventWindow from './Features/Windows/EventWindow';
import DayWindow from './Features/Windows/DayWindow';
import ContactsLoader from './Features/Contacts/ContactsLoader';

function App() {
  return (
    <div className="App">
      <Calendar></Calendar>
      
      <SettingsWindow />      
      <DayWindow />
      <EventWindow />

      <EventsLoader />
      <ContactsLoader />
    </div>
  );
}

export default App;
