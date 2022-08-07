import React, {useState} from 'react';
import NavContent from './NavContent';
import Balance from './Balance';
import './NavBar.css';

function NavBar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    return (<div class="NavBar">
        <div class="tabs">
            <ul class="tabsList"><NavContent /></ul>
        </div>
        {/* <Balance /> */}
    </div>)
}

export default NavBar;