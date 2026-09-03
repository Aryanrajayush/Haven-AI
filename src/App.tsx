/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Notebook from './pages/Notebook';
import Reminders from './pages/Reminders';
import PreviousChats from './pages/PreviousChats';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="journal" element={<Journal />} />
          <Route path="notebook" element={<Notebook />} />
          <Route path="reminders" element={<Reminders />} />
          <Route path="previous-chats" element={<PreviousChats />} />
        </Route>
      </Routes>
    </Router>
  );
}
