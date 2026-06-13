import { Routes, Route } from "react-router-dom"
import Menu from "./Menu.jsx"
import Form from "./Form.jsx"
import Setting from "./Setting.jsx"
import CityLinkForm from "./CityLinkForm.jsx"
import AdminCityLinkEntries from "./AdminCityLinkEntries.jsx"

function App() {
  return (
    <Routes>
      {/* First page */}
      <Route path="/" element={<Menu />} />

      {/* Main App page */}
      <Route path="/form" element={<Form />} />
      <Route path="/fip" element={<CityLinkForm />} />
      <Route path="/admin/fip" element={<AdminCityLinkEntries />} />
      <Route path="/setting" element={<Setting />} />
    </Routes>
  )
}

export default App