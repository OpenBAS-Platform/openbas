import React, {Component} from 'react'
import {T} from '../../components/I18n'
import {i18nRegister} from '../../utils/Messages'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from '../../components/Card';

i18nRegister({
  fr: {
    'Welcome to OpenEX {name}': 'Bienvenue to OpenEX {name}'
  }
})

class IndexAuthenticated extends Component {
  render() {
    return (
      <div>
        <Card>
          <CardHeader
            title="Secrétariat générale de la défense et de la sécurité nationale"
            avatar="../../../public/images/sgdsn.png"
          />
          <CardMedia overlay={<CardTitle title="SECNUC 16" subtitle="Exercice gouvernemental majeur" />}>
            <img src="../../../public/images/secnuc16.jpg" />
          </CardMedia>
          <CardTitle title="Card title" subtitle="Card subtitle" />
          <CardText>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Donec mattis pretium massa. Aliquam erat volutpat. Nulla facilisi.
            Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed pellentesque.
            Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
          </CardText>
        </Card>
      </div>
    );
  }
}
export default IndexAuthenticated;