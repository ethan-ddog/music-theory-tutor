import React from "react";
import Note from "./Note.jsx";
import NoteNameDisplay from "./NoteNameDisplay.jsx";
import IntervalDisplay from "./IntervalDisplay.jsx";
import treble from './images/treble.png';
import bass from './images/Bass.png';
import { chromatic } from "./chromatic.js";

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
		this.stopChord = this.stopChord.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onRelease = this.onRelease.bind(this);
		this.getNextNote = this.getNextNote.bind(this);
		this.moveSelectedNotes = this.moveSelectedNotes.bind(this);
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
			return;
		}
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
			this.c.play({ volume: 0.001, pitch: note.name, label: note.name, env: { hold: -1, release: 0.1, attack: 0.1 } });
		});
	}

	sortAscendingNotes(arr) {
		const result = arr.slice();
		// take array of note names and return array sorted from lowest to highest.
		result.sort((x, y) => {
			console.log('comparing', x, y)
			let idx1, idx2;
			for (var i = 0; i < chromatic.length; i++) {
				if (chromatic[i].includes(x.name)) {
					idx1 = i;
				}
				if (chromatic[i].includes(y.name)) {
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
		console.log('sorted result:', result);
		return result;
	}

	// return the new value for the current note after moving one half-step in specified direction
	getNextNote(currentNote, direction) {
		let c = null;
		chromatic.forEach((tuple, i) => {
			if (tuple.indexOf(currentNote.name) !== -1) {
				c = i;
			}
		});
		// let n = this.props.name;
		if (direction === "up" && chromatic[c + 1]) {
			return chromatic[c + 1][0]; // 0th index of tuple is the 'ascending' enharmonic spelling of the note.
		} else if (direction === "down" && chromatic[c - 1]) {
			return chromatic[c - 1][1]; // index 1 of tuple is the 'descending' enharmonic spelling of the note.
		} else {
			return null;
		}
	}

	moveSelectedNotes(direction) {
		const newNotes = this.state.notes.slice();
		this.state.selectedNotes.forEach(noteIndex => {
			const nextNoteName = this.getNextNote(this.state.notes[noteIndex], direction);
			newNotes[noteIndex].name = nextNoteName;
		});
		this.setState({ notes: newNotes });
	}

	onKeyDown(e) {
		if (e.keyCode === 32 && !this.isPlaying) {
			this.playChord();
			return;
		}
		if (e.keyCode === 8) {
			this.deleteNotes(this.state.selectedNotes);
		}
		if (e.keyCode === 38) {
			this.moveSelectedNotes('up');
		}
		if (e.keyCode === 40) {
			this.moveSelectedNotes('down');
		}
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
						const indexOfNote = this.state.notes.findIndex(n => n.name.length === 2 ? n.name.toLowerCase() === note.toLowerCase() : (n.name[0] + n.name[2]).toLowerCase() === note.toLowerCase());
						return <div className={className} onClick={this.addNote} id={note} key={note + '-staff'}>
							{indexOfNote > -1 ? <Note index={indexOfNote} selected={this.state.selectedNotes.includes(indexOfNote)} name={this.state.notes[indexOfNote].name} changeSelection={this.changeSelection} changeNote={this.changeNote} /> : null}
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
							{this.sortAscendingNotes(this.state.notes).map(
								({name}, i) => {
									console.log('name', name)
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
							selectedNotes={this.sortAscendingNotes(this.state.notes.filter((_, i) => this.state.selectedNotes.includes(i)))}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default GrandStaff;
