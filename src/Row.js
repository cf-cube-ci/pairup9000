import React, { Component } from 'react';
import { DropTarget } from 'react-dnd';
import Radium from 'radium';

import Pair from './Pair';
import Badge from './Badge';

const rowStyle = {
  base: {
    marginBottom: 12,
    height: 130,
    width: "100%",
    position: "relative",
    borderRadius: 2
  },
  alternate: {
  },
}

const leftStyle = {
  width: 250,
}

const rightStyle = {
  position: "absolute",
  left: 280,
  width: 432,
  top: 20,
}

const inputStyle = {
  height: 80,
  width: "100%",
  border: 0,
  paddingLeft: 4,
  background: "none",
  fontFamily: "IBM Plex Serif",
  color: "#fff",
  fontSize: "xx-large",
  borderBottom: "1px solid #27ae60",
}

class Row extends Component {
  render() {
    const badges = (this.props.badges|| []).map(badge => (
      <Badge name={badge}/>
    ))

    return this.props.connectDropTarget(
      <div style={[
        rowStyle.base,
        this.props.alternate && rowStyle.alternate,
      ]}>
        <div style={leftStyle}>
          <Pair
            members={this.props.pair}
            onCardDropped={ (card, pos) => this.props.onCardDropped( card, this.props.track, pos ) }
            onCardHovered={ (card, pos) => this.props.onCardHovered( card, this.props.track, pos ) }
            onToggleLock={ (card) => this.props.onToggleLock(card) }
          />
          {badges}
        </div>
        <div style={rightStyle}>
          <input
            style={inputStyle}
            type="text"
            value={this.props.trackName}
            onChange={ (event) => this.props.onTrackNameChanged(this.props.track, event.target.value) }
          />
        </div>
      </div>
    )
  }
}

export default DropTarget(["BADGE"], {
  drop(props, monitor) {
    props.onBadgeAssigned(props.track, monitor.getItem().name)
  }
}, (connect, monitor) => {
  return {
    "connectDropTarget": connect.dropTarget(),
    "hovered": monitor.isOver(),
  }
})(Radium(Row));
