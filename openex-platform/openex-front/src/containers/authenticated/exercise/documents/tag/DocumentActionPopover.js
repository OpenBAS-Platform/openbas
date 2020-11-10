import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {i18nRegister} from '../../../../../utils/Messages'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover'
import {Menu} from '../../../../../components/Menu'
import {Dialog} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink} from '../../../../../components/menu/MenuItem'
import {T} from '../../../../../components/I18n'

i18nRegister({
    fr: {
        'Edit': 'Modifier',
        'List of TAGS': 'Liste des Tags',
        'Delete': 'Supprimer',
        'Download': 'Télécharger',
        'Delete Document': 'Supprimer un document',
        'Are you sure you want to delete this document ?': 'Êtes vous sûr de vouloir supprimer ce document ?'
    }
})

const style = {
    float: 'left',
    marginTop: '-14px'
}

class DocumentActionPopover extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openPopover: false,
            openConfirmDelete: false
        }
    }

    handlePopoverOpen(event) {
        event.stopPropagation()
        this.setState({openPopover: true, anchorEl: event.currentTarget})
    }

    handlePopoverClose() {
        this.setState({openPopover: false})
    }

    handleCloseOpenConfirmDelete() {
        this.setState({openConfirmDelete: false})
    }

    handleOpenConfirmDelete() {
        this.handlePopoverClose()
        this.setState({openConfirmDelete: true})
    }

    editDocument() {
        this.handlePopoverClose()
        return this.props.handleEditDocument(this.props.document)
    }

    viewDocument() {
        this.handlePopoverClose()
        return this.props.handleViewDocument(this.props.document)
    }

    editDocumentTag() {
        this.handlePopoverClose()
        return this.props.handleEditDocumentTag(this.props.document.document_id)
    }

    deleteDocument() {
        this.handleCloseOpenConfirmDelete()
        return this.props.handleDeleteDocument(this.props.document)
    }

    render() {

        const actionsOpenConfirmDelete = [
          <FlatButton key="cancel" label="Cancel" primary={true} onClick={this.handleCloseOpenConfirmDelete.bind(this)}/>,
          <FlatButton key="submit" label="Submit" primary={true} onClick={this.deleteDocument.bind(this)}/>
        ]

        return (<div  style={style}>
                    <IconButton onClick={this.handlePopoverOpen.bind(this)}>
                        <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
                    </IconButton>
                    <Popover open={this.state.openPopover} onRequestClose={this.handlePopoverClose.bind(this)} anchorEl={this.state.anchorEl}>
                        <Menu multiple={false}>
                            <MenuItemLink label="Edit" onClick={this.editDocument.bind(this)}/>
                            <MenuItemLink label="Download" onClick={this.viewDocument.bind(this)}/>
                            <MenuItemLink label="List of TAGS" onClick={this.editDocumentTag.bind(this)}/>
                            <MenuItemLink label="Delete" onClick={this.handleOpenConfirmDelete.bind(this)}/>
                        </Menu>
                    </Popover>
                    <Dialog title="Delete Document" modal={false} open={this.state.openConfirmDelete}
                            onRequestClose={this.handleCloseOpenConfirmDelete.bind(this)} actions={actionsOpenConfirmDelete}>
                            <T>Are you sure you want to delete this document ?</T>
                    </Dialog>
                </div>
            )
        }
}

DocumentActionPopover.propTypes = {
    document_id: PropTypes.string,
    document: PropTypes.object,
    documents: PropTypes.object,
    handleEditDocument: PropTypes.func,
    handleViewDocument: PropTypes.func,
    handleEditDocumentTag: PropTypes.func,
    handleDeleteDocument: PropTypes.func
}

const select = (state) => {
    return {
        documents: state.referential.entities.document
    }
}

export default connect(select, {})(DocumentActionPopover)
