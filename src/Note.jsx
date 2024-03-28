import React from "react";
import Accidental from "./Accidental.jsx";

class Note extends React.Component {
	constructor(props) {
		super(props);
		this.select = this.select.bind(this);
		this.getAccidental = this.getAccidental.bind(this);
	}

	getAccidental(noteName) {
		// look for '#' or 'b' in the note name at index 1
		if (noteName[1] === "#") {
			return "sharp";
		} else if (noteName[1] === "b") {
			return "flat";
		}

		return "";
	}

	select(e) {
		this.props.changeSelection(this.props.index, !this.props.selected);
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.keydownHandler);
	}

	render() {
		return (
			<div className="noteAndAccidentalContainer" id={this.props.index}>
				<Accidental type={this.getAccidental(this.props.name)} />
				<div
					onClick={this.select}
					className={!this.props.selected ? "note" : "activeNote"}
				/>
			</div>
		);
	}
}

export default Note;
