import React, {Component, PropTypes} from 'react';
import {logout} from '../../actions/Application';
import {Popover} from '../../components/Popover';
import * as MaterialMenu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import {RoundSpinner} from '../../components/Spinner';
import {connect} from 'react-redux';
import {userInfo} from '../../actions/Application';
import * as Constants from '../../constants/ComponentTypes';

class Menu extends Component {

    componentDidMount() {
        const {firstname} = this.props
        if (!firstname) {
            this.props.userInfo()
        }
    }

    logoutClick() {
        this.props.logout();
    }

    render() {
        if (this.props.firstname) {
            return (
                <div>
                    <Popover type={Constants.POPOVER_TYPE_AVATAR} avatar={this.props.firstname}>
                        <MaterialMenu.Menu>
                            <MenuItem onClick={this.logoutClick.bind(this)} primaryText="Sign out"/>
                        </MaterialMenu.Menu>
                    </Popover>
                </div>
            )
        } else {
            return <RoundSpinner/>
        }
    }
}

Menu.propTypes = {
    logout: PropTypes.func.isRequired,
    userInfo: PropTypes.func.isRequired,
    firstname: PropTypes.string
}

const select = (state) => {
    var firstname = state.application.getIn(['entities', 'users', 'me', 'firstname']);
    return {
        firstname: firstname ? firstname.slice(0, 1).toUpperCase() : null
    }
}
export default connect(select, {logout, userInfo})(Menu);


