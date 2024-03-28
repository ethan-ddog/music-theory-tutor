import React from "react";

import flat from './images/flat.png';
import sharp from './images/sharp.png'

class Accidental extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		// set appropriate accidental depending on type passed in via props.
		var src =
			this.props.type === "sharp"
				? sharp
				: this.props.type === "flat" ? flat : "";
		return src !== "" ? (
			<div className="accidentalContainer" id={this.props.type}>
				<img className="accidental" src={src} alt="accidental" />
			</div>
		) : null; // return nothing if no type specified.
	}
}

export default Accidental;
