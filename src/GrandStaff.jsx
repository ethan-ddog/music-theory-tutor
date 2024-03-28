import React from "react";
import Note from "./Note.jsx";
import NoteNameDisplay from "./NoteNameDisplay.jsx";
import IntervalDisplay from "./IntervalDisplay.jsx";
import $ from "jquery";
import treble from './images/treble.png';
import bass from './images/Bass.png';
var Wad = require("web-audio-daw");
var chromatic = require("./chromatic.js").chromatic;


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
		this.deleteNote = this.deleteNote.bind(this);
		this.playChord = this.playChord.bind(this);
		this.getNotesToDisplay = this.getNotesToDisplay.bind(this);
		this.addNote = this.addNote.bind(this);
		this.sortAscendingNotes = this.sortAscendingNotes.bind(this);
		this.saveChord = this.saveChord.bind(this);
		this.stopChord = this.stopChord.bind(this);
		this.onPlay = this.onPlay.bind(this);
		this.onRelease = this.onRelease.bind(this);
		// this.changeChord = this.changeChord.bind(this);

		const sine = new Wad({ source: "sine" });
		const sawtooth = new Wad({ source: "sawtooth" });
		const triangle = new Wad({ source: 'triangle' });
		this.c = new Wad.Poly({
			filter: {
				type: 'lowpass',
				frequency: 700,
				q: 3,
			}
		});
		this.c.add(sine).add(sawtooth).add(triangle);
		this.isPlaying = false;
	}

	addNote(e) {
		let newNote = { name: e.target.id.toUpperCase(), deleted: false };
		this.state.notes.push(newNote);
		this.state.notesToDisplay.push(newNote.name);
		this.setState({
			notes: this.state.notes,
			notesToDisplay: this.state.notesToDisplay
		});
	}

	changeNote(oldNote, newNote, index) {
		// this function updates the note at parameter index.
		let n = this.state.notes;
		n[index].deleted === false
			? (n[index] = { name: newNote, deleted: false })
			: console.log("you already deleted this note!");
		this.setState(
			{
				notes: n
			},
			() => {
				this.setState({
					notesToDisplay: this.getNotesToDisplay()
				});
			}
		);
	}

	changeSelection(index, bool) {
		if (bool) {
			// add note to set of selected notes
			let s = this.state.selectedNotes;
			s.push(index);
			this.setState({
				selectedNotes: s
			});
		} else {
			// remove note from set of selected notes
			let s = this.state.selectedNotes;
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

	deleteNote(index) {
		// flip deleted flag on note at index
		let n = this.state.notes;
		n[index].deleted = true;
		this.setState({ notes: n });

		// remove note from notesToDisplay and selectedNotes
		let noteToDelete = this.state.notes[index].name;
		let found = this.state.notesToDisplay.indexOf(noteToDelete);
		if (found >= 0) {
			this.state.notesToDisplay.splice(found, 1);
			this.setState(
				{
					notesToDisplay: this.state.notesToDisplay
				},
				() => {
					this.state.selectedNotes.splice(
						this.state.selectedNotes.indexOf(index),
						1
					);
					this.setState({
						selectedNotes: this.state.selectedNotes,
						notesToDisplay: this.getNotesToDisplay()
					});
				}
			);
		}
	}

	getNotesToDisplay() {
		let result = this.state.notes
			.filter(note => note.deleted === false)
			.map(obj => obj.name);
		return result;
	}

	stopChord() {
		this.state.notes.forEach(({ name, deleted }) => {
			if (!deleted) {
				this.c.stop(name);
			}
		});
		this.isPlaying = false;
	}

	playChord() {
		if (this.isPlaying) return;
		this.isPlaying = true;
		// use the web audio daw to play all the notes on the staff.
		let chord = [];
		this.state.notes.forEach(obj => {
			if (obj.deleted === false) {
				chord.push(obj.name);
			}
		});

		chord.forEach((note) => {
			console.log('playing note:', note);
			this.c.play({ volume: 0.005, pitch: note, label: note, env: { hold: -1, release: 0 } });
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

	onPlay(e) {
		if (e.keyCode === 32 && !this.state.playing) {
			this.playChord();
		}
	}

	onRelease(e) {
		if (e.keyCode === 32) {
			this.stopChord();
		}
	}

	componentDidMount() {
		document.addEventListener('keydown', this.onPlay);
		document.addEventListener('keyup', this.onRelease)
	}

	componentWillMount() {
		this.setState({
			notesToDisplay: this.state.notes.map(obj => obj.name)
		});
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.onPlay);
		document.removeEventListener('keyup', this.onRelease);
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
					{this.state.notes.map((note, i) => {
						return (
							<Note
								name={note.name}
								key={i}
								index={i}
								changeSelection={this.changeSelection}
								changeNote={this.changeNote}
								deleteNote={this.deleteNote}
							/>
						);
					})}
					<div className="ledger-line" id="a5" onClick={this.addNote} />
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