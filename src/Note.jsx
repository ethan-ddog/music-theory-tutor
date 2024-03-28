import React from "react";
import $ from "jquery";
import Accidental from "./Accidental.jsx";
let chromatic = require("./chromatic.js").chromatic;

class Note extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			chromaticIndex: undefined, // initialize to undefined - on componentWillMount, use name to lookup/set value.
		};
		this.select = this.select.bind(this);
		this.getNextNote = this.getNextNote.bind(this);
		this.moveNote = this.moveNote.bind(this);
		this.getAccidental = this.getAccidental.bind(this);
		this.lookupChromaticIndex = this.lookupChromaticIndex.bind(this);
		// this.keydownHandler = this.keydownHandler.bind(this);
	}

	lookupChromaticIndex(noteName) {
		let result = null;
		chromatic.forEach((tuple, i) => {
			if (tuple.indexOf(noteName) !== -1) {
				result = i;
			}
		});
		return result;
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

	moveNote(direction) {
		if (this.state.selected) {
			let $child = $("#" + this.props.index);
			let $parent = $child.parent();
			if (direction === "up") {
				// get div above $parent
				let $above = $parent.prev();
				// remove note/accidental from $parent and append to $above
				$child.remove();
				$above.append($child);
			}
			if (direction === "down") {
				// get div below $parent
				let $below = $parent.next();
				// remove note/accidental from $parent and append to $below
				$child.remove();
				$below.append($child);
			}
		}
	}

	getNextNote(direction) {
		//////////////////////////////////////////////////////////////////////////////////////////
		// this function looks for the next note in the direction user clicks (up or down).
		//
		// if the next note has a different letter name (i.e. D# -> E ), it will trigger the note
		// to move to the next div in the given direction.
		//
		//////////////////////////////////////////////////////////////////////////////////////////
		let c = this.state.chromaticIndex;
		let n = this.props.name;
		if (direction === "up" && chromatic[c + 1]) {
			let newNote = chromatic[c + 1][0]; // 0th index of tuple is the 'ascending' enharmonic spelling of the note.
			this.setState({
				chromaticIndex: c + 1,
				name: newNote
			});
			if (n[0] !== newNote[0]) {
				// note letter changed - note needs to move
				this.moveNote("up");
			}
			return newNote;
		} else if (direction === "down" && chromatic[c - 1]) {
			let newNote = chromatic[c - 1][1]; // index 1 of tuple is the 'descending' enharmonic spelling of the note.
			this.setState({
				chromaticIndex: c - 1,
				name: newNote
			});
			if (n[0] !== newNote[0]) {
				// note letter changed - note needs to move.
				this.moveNote("down");
			}
			return newNote;
		} else {
			return null;
		}
	}

	select(e) {
		this.props.changeSelection(this.props.index, !this.props.selected);
	}

	// keydownHandler(e) {
	// 	// only fire events if note is selected.
	// 	if (this.state.selected) {
	// 		let n = this.props.name;
	// 		if (e.which === 8) {
	// 			this.props.deleteNote(this.props.index);
	// 		}
	// 		if (e.which === 38) {
	// 			var nextNote = this.getNextNote("up");
	// 			if (nextNote !== null) {
	// 				this.props.changeNote(n, nextNote, this.props.index); // callback function from parent component updates parent state
	// 			}
	// 		} else if (e.which === 40) {
	// 			var nextNote = this.getNextNote("down");
	// 			if (nextNote !== null) {
	// 				this.props.changeNote(n, nextNote, this.props.index); // callback function from parent component updates parent state
	// 			}
	// 		}
	// 		if (nextNote !== undefined) {
	// 			this.setState({
	// 				note: nextNote
	// 			});
	// 		}
	// 	}
	// }

	componentWillMount() {
		let i = this.lookupChromaticIndex(this.props.name);
		this.setState({
			chromaticIndex: i
		});
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
