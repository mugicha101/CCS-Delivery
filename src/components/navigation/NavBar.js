import React, {useState} from 'react';
import Dropdown from './Dropdown';
import Tabs from './Tabs';
import './NavBar.css';

function NavBar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    return (<div class="NavBar">
        <Tabs />
        <Dropdown />
    </div>)
}

export default NavBar;