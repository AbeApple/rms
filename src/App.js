import './App.css';
import Calendar from './Features/Calendar/Calendar';
import EventsLoader from './Features/Events/EventsLoader';
import EventWindow from './Features/Windows/Event/EventWindow';
import DayWindow from './Features/Windows/Day/DayWindow';
import ContactWindow from './Features/Windows/Contact/ContactWindow';
import ContactsLoader from './Features/Contacts/ContactsLoader';
import ImagesWindow from './Features/Windows/Images/ImagesWIndow';
import MenuWindow from './Features/Windows/Menu/MenuWindow';

function App() {
  return (
    <div className="App">
      <Calendar></Calendar>
      
      <MenuWindow />      
      <DayWindow />
      <EventWindow />
      <ContactWindow />
      <ImagesWindow />

      <EventsLoader />
      <ContactsLoader />
    </div>
  );
}

export default App;
