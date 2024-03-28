import React from "react";
import Note from "./Note.jsx";
import NoteNameDisplay from "./NoteNameDisplay.jsx";
import IntervalDisplay from "./IntervalDisplay.jsx";
import $ from "jquery";
import treble from './images/treble.png';
import bass from './images/Bass.png';
var chromatic = require("./chromatic.js").chromatic;

/**
 * 					<div className="ledger-line" id="a5" onClick={this.addNote} />
					<div className="space" id="g5" onClick={this.addNote} />
					<div className="line" id="f5" onClick={this.addNote} />
					<div className="space" id="e5" onClick={this.addNote} />
					<div className="line" id="d5" onClick={this.addNote} />
					<div className="space" id="c5" onClick={this.addNote} />
					<div className="line" id="b4" onClick={this.addNote} />
					<div className="space" id="a4" onClick={this.addNote} />
					<div className="line" id="g4" onClick={this.addNote} />
					<div className="space" id="f4" onClick={this.addNote} />
					<div className="line" id="e4" onClick={this.addNote} />
					<div className="space" id="d4" onClick={this.addNote} />
					<div className="ledger-line" id="c4" onClick={this.addNote} />
					<div className="space" id="b3" onClick={this.addNote} />
					<div className="line" id="a3" onClick={this.addNote} />
					<div className="space" id="g3" onClick={this.addNote} />
					<div className="line" id="f3" onClick={this.addNote} />
					<div className="space" id="e3" onClick={this.addNote} />
					<div className="line" id="d3" onClick={this.addNote} />
					<div className="space" id="c3" onClick={this.addNote} />
					<div className="line" id="b2" onClick={this.addNote} />
					<div className="space" id="a2" onClick={this.addNote} />
					<div className="line" id="g2" onClick={this.addNote} />
					<div className="space" id="f2" onClick={this.addNote} />
					<div className="ledger-line" id="e2" onClick={this.addNote} />
 */

const STAFF_NOTES = ['e2', 'f2', 'g2', 'a2', 'b2', 'c3', 'd3', 'e3', 'f3', 'g3', 'a3', 'b3', 'c4', 'd4', 'e4', 'f4', 'g4', 'a4', 'b4', 'c5', 'd5', 'e5', 'f5', 'g5', 'a5'].reverse();

class GrandStaff extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			notes: [],
			selectedNotes: [],
			notesToDisplay: [],
		};
		this.changeNote = this.changeNote.bind(this);
		this.changeSelection = this.changeSelection.bind(this);
		this.deleteNotes = this.deleteNotes.bind(this);
		this.playChord = this.playChord.bind(this);
		this.addNote = this.addNote.bind(this);
		this.sortAscendingNotes = this.sortAscendingNotes.bind(this);
		this.saveChord = this.saveChord.bind(this);
		this.stopChord = this.stopChord.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onRelease = this.onRelease.bind(this);
		this.isPlaying = false;
		this.c = null
	}

	componentDidMount() {
		document.addEventListener('keydown', this.onKeyDown);
		document.addEventListener('keyup', this.onRelease);

	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.onKeyDown);
		document.removeEventListener('keyup', this.onRelease);
	}



	addNote(e) {
		if (!this.c) {
			const Wad = require("web-audio-daw");
			this.c = new Wad.Poly({
				filter: {
					type: 'lowpass',
					frequency: 700,
					q: 3,
				}
			});
			const sine = new Wad({ source: "sine" });
			// const sawtooth = new Wad({ source: "sawtooth" });
			const triangle = new Wad({ source: 'triangle' });
			this.c.add(sine).add(triangle);
		}
		let newNote = { name: e.target.id.toUpperCase() };
		// prevent duplicate notes
		if (!e.target.id || this.state.notes.some(note => note.name === newNote.name)) {
			console.log('returning early')
			return;
		}
		console.log('setting notes:', [...this.state.notes, newNote]);
		this.setState({
			notes: [...this.state.notes, newNote],
			notesToDisplay: [...this.state.notesToDisplay, newNote.name]
		});
	}

	changeNote(oldNote, newNote, index) {
		// this function updates the note at parameter index.
		let n = this.state.notes.slice();
		n[index] = { name: newNote }
		this.setState(
			{
				notes: n
			}
		);
	}

	changeSelection(index, bool) {
		if (bool) {
			// add note to set of selected notes
			let s = this.state.selectedNotes.slice();
			s.push(index);
			this.setState({
				selectedNotes: s
			});
		} else {
			// remove note from set of selected notes
			let s = this.state.selectedNotes.slice();
			let x = [];
			s.forEach(el => {
				if (el === index) {
					return
				}
				x.push(el)
			});
			this.setState({
				selectedNotes: x
			});
		}
	}

	deleteNotes(indices) {
		const newNotes = [];
		this.state.notes.forEach((note, i) => {
			if (!indices.includes(i)) {
				newNotes.push(note);
			}
		});
		this.setState({ notes: newNotes, selectedNotes: [], notesToDisplay: newNotes.map(({ name }) => name) });
	}

	stopChord() {
		this.state.notes.forEach(({ name }) => {
			this.c.stop(name);
		});
		this.isPlaying = false;
	}

	playChord() {
		if (this.isPlaying) return;
		this.isPlaying = true;
		// use the web audio daw to play all the notes on the staff.
		this.state.notes.forEach((note) => {
			console.log('playing note:', note);
			this.c.play({ volume: 0.001, pitch: note.name, label: note.name, env: { hold: -1, release: 0.1, attack: 0.1 } });
		});
	}

	saveChord() {
		let chord = this.state.notesToDisplay;
		let name = $("#chordName").val();
		this.props.saveChord({ name: name, notes: chord });
	}

	sortAscendingNotes(arr) {
		// take array of note names and return array sorted from lowest to highest.
		return arr.sort((x, y) => {
			let idx1, idx2;
			for (var i = 0; i < chromatic.length; i++) {
				if (chromatic[i].includes(x)) {
					idx1 = i;
				}
				if (chromatic[i].includes(y)) {
					idx2 = i;
				}
			}

			// sort:
			if (idx1 < idx2) {
				return -1;
			}

			if (idx1 > idx2) {
				return 1;
			}

			return 0;
		});
	}

	onKeyDown(e) {
		if (e.keyCode === 32 && !this.state.playing) {
			this.playChord();
			return;
		}
		if (e.keyCode === 8) {
			this.deleteNotes(this.state.selectedNotes);
		}
		// this.state.selectedNotes.forEach(noteIndex => {
		// 	console.log('note index:', noteIndex);
		// 	console.log('corresponding note', this.state.notes[noteIndex]);
		// 	const noteName = this.state.notes[noteIndex].name;
		// 	if (e.keyCode === 8) {
		// 		this.deleteNote(noteIndex);
		// 		return;
		// 	}
		// 	if (this.keyCode === 38) {
		// 		// TODO move note up
		// 		// const nextNote = t
		// 	}
		// 	if (this.keyCode === 40) {
		// 		// TODO move note down
		// 	}
		// })
		// only fire events if note is selected.
		// if (this.state.selected) {
		// 	let n = this.props.name;
		// 	// if (e.which === 8) {
		// 	// 	this.props.deleteNote(this.props.index);
		// 	// }
		// 	if (e.which === 38) {
		// 		var nextNote = this.getNextNote("up");
		// 		if (nextNote !== null) {
		// 			this.props.changeNote(n, nextNote, this.props.index); // callback function from parent component updates parent state
		// 		}
		// 	} else if (e.which === 40) {
		// 		var nextNote = this.getNextNote("down");
		// 		if (nextNote !== null) {
		// 			this.props.changeNote(n, nextNote, this.props.index); // callback function from parent component updates parent state
		// 		}
		// 	}
		// 	if (nextNote !== undefined) {
		// 		this.setState({
		// 			note: nextNote
		// 		});
		// 	}
		// }
	}

	onRelease(e) {
		if (e.keyCode === 32) {
			this.stopChord();
		}
	}

	render() {
		return (
			<div id="staffContainer">
				<div id="trebleContainer">
					<img src={treble} className="trebleClef" />
				</div>
				<div id="bassContainer">
					<img src={bass} className="bassClef" />
				</div>
				<div>
					{STAFF_NOTES.map((note, i) => {
						const className = i === 0 || i === 12 || i === 24 ? 'ledger-line' : i % 2 === 0 ? 'line' : 'space';
						const indexOfNote = this.state.notes.findIndex(n => n.name.toLowerCase() === note.toLowerCase());
						return <div className={className} onClick={this.addNote} id={note} key={note + '-staff'}>
							{indexOfNote > -1 ? <Note index={indexOfNote} name={note} changeSelection={this.changeSelection} changeNote={this.changeNote} /> : null}
						</div>
					})}
				</div>
				<div id="displayContainer">
					{this.state.notesToDisplay.length === 0 ? (
						<div id="noteNameDisplayContainer">
							<h3>
								Add notes by clicking on the lines and spaces above. <br />{" "}
								Selected notes can be moved up and down with the arrow keys, or
								deleted with the delete key.
							</h3>
						</div>
					) : (
						<div id="noteNameDisplayContainer">
							{this.sortAscendingNotes(this.state.notesToDisplay).map(
								(name, i) => {
									return (
										<NoteNameDisplay
											name={name}
											key={i}
											selectedNotes={this.state.selectedNotes}
											notes={this.state.notes}
											addToInterval={this.addNoteToInterval}
										/>
									);
								}
							)}
						</div>
					)}
					<div id="intervalDisplayContainer">
						<IntervalDisplay
							selectedNotes={this.state.selectedNotes}
							notes={this.state.notes}
							sort={this.sortAscendingNotes}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default GrandStaff;
