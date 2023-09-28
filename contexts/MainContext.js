import React, {useState} from 'react';
import PropTypes from 'prop-types';

const MainContext = React.createContext({});

const MainProvider = (props) => {
  // create state isLoggedIn, set value to false
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  return (
    <MainContext.Provider value={{isLoggedIn, setIsLoggedIn, user, setUser}}>
      {props.children}
    </MainContext.Provider>
  );
};

MainProvider.propTypes = {
  children: PropTypes.node,
};

export {MainContext, MainProvider};
