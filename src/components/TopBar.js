import React, {PropTypes, Component} from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import {LinkButton} from '../components/Button'

const style = {
    menu: {
        width: 280
    },
    overlay: {
        backgroundColor: "#ffffff",
        opacity: 0
    }
};

class TopBar extends Component {

    constructor(props) {
        super(props);
        this.state = {open: false};
    }

    handleToggle() {
        this.setState({open: !this.state.open})
    }

    handleClose() {
        this.setState({open: false})
    }

    render() {
        return (
            <div>
                <AppBar title={this.props.title} iconElementLeft={this.props.left} iconElementRight={this.props.right}
                        onLeftIconButtonTouchTap={this.handleToggle.bind(this)}/>
                <Drawer docked={false} width={style.menu.width} open={this.state.open}
                        onRequestChange={(open) => this.setState({open})} overlayStyle={style.overlay}>
                    <LinkButton onTouchTap={this.handleClose.bind(this)} label="Index" to="/"/>
                    <br/>
                    <LinkButton onTouchTap={this.handleClose.bind(this)} label="Domains" to="domains"/>
                </Drawer>
            </div>
        );
    }
}

TopBar.propTypes = {
    title: PropTypes.string.isRequired,
    left: PropTypes.object,
    right: PropTypes.object
}


export default TopBar;