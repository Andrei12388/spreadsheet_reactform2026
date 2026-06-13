import { Routes, Route } from "react-router-dom"
import Menu from "./Menu.jsx"
import Form from "./Form.jsx"
import Setting from "./Setting.jsx"
import CityLinkForm from "./CityLinkForm.jsx"

function App() {
  return (
    <Routes>
      {/* First page */}
      <Route path="/" element={<Menu />} />

      {/* Main App page */}
      <Route path="/form" element={<Form />} />
      <Route path="/citylink" element={<CityLinkForm />} />
       <Route path="/setting" element={<Setting />} />
    </Routes>
  )
}

export default App