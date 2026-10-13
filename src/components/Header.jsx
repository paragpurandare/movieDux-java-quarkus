// import { Link, NavLink } from 'react-router-dom';
// import { Button } from 'antd';
// import { SearchOutlined } from '@ant-design/icons';

// export default function Header() {
//   return (
//     <header className="site-header">
//       <Link to="/" className="brand">
//         MovieDux
//       </Link>

//       <nav className="site-nav">
//         <NavLink to="/">Movies</NavLink>
//         <NavLink to="/watchlist">My Watchlist</NavLink>
//       </nav>

//       <Button
//         type="text"
//         icon={<SearchOutlined />}
//         onClick={() => {
//           document
//             .getElementById('movie-search')
//             ?.focus();
//         }}
//         aria-label="Focus movie search"
//       />
//     </header>
//   );
// }




//Ant Design v1
import { Typography } from 'antd';

const { Title } = Typography;

const Header = () => {
  return (
    <header className="header">
      <img
        className="logo"
        src="/logo.png"
        alt="MovieDux"
      />

      <Title level={4} className="app-subtitle">
        It's time for popcorn! Find your next movie here.
      </Title>
    </header>
  );
};

export default Header;


//without Ant design
// import React from 'react';
// import '../styles.css';

// const Header = () => {
//     return (
//         <div className='header'>
//             <img className='logo' src='logo.png' alt="moviedux" />
//             <h2 className='app-subtitle'>It's time for popcorn! Find your next movie here.</h2>
//         </div>
//     );
// }

// export default Header;
