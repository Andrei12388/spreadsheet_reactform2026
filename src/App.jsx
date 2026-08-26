import { Routes, Route } from "react-router-dom"
import Menu from "./Menu.jsx"
import Form from "./Form.jsx"
import Setting from "./Setting.jsx"
import CityLinkForm from "./CityLinkForm.jsx"
import AdminCityLinkEntries from "./AdminCityLinkEntries.jsx"
import JMCMainPage from "./jmc/jmcMain.jsx"
import JMCMenu from "./jmc/jmcMenu.jsx"
import NewForm from "./newForm/newForm.jsx"
import AdminNewForm from "./newForm/adminNewForm.jsx"

function App() {
  return (
    <Routes>
      {/* First page */}
      <Route path="/" element={<Menu />} />

      {/* Main App page */}
      <Route path="/form" element={<Form />} />
      <Route path="/setting" element={<Setting />} />

       {/* JMC App page */}
       <Route path="/jmcReport" element={<JMCMenu />} />
       <Route path="/jmcForm" element={<JMCMainPage />} />

       {/*FIP App Page */}
       <Route path="/fip" element={<CityLinkForm />} />
       <Route path="/admin/fip" element={<AdminCityLinkEntries />} />

       {/*scsr App Page */}
       <Route path="/scsr" element={<NewForm />} />
       <Route path="/admin/scsr" element={<AdminNewForm />} />

    </Routes>
  )
}

export default App