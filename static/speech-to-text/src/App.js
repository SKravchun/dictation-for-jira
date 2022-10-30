import React, {Fragment} from 'react';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import Button from '@atlaskit/button';
import './css/app.css'
import {useRef, useCallback, useState, useEffect} from "react";
import {view, router} from '@forge/bridge';
import TextArea from '@atlaskit/textarea';
import VidAudioOnIcon from '@atlaskit/icon/glyph/vid-audio-on'
import Tooltip from '@atlaskit/tooltip';
import QuestionCircleIcon from '@atlaskit/icon/glyph/question-circle'
import {createComment, setDescription} from "./utils/requests";
import {changeSelectedText, firstSymbol, handleListing, handleReset, select} from "./utils/helpers";
import ClearModal from "./components/ClearModal";
import Flag from "./components/Flag";

function App() {
  const [isListening, setIsListening] = useState(false);
  const [area, setArea] = useState('');
  const [context, setContext] = useState();

  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const [descriptionFlags, setDescriptionFlags] = useState([]);
  const [commentFlags, setCommentFlags] = useState([]);

  const textareaInput = useRef(null)


  let {
    finalTranscript,
    resetTranscript,
    listening,
  } = useSpeechRecognition()


  const newDescriptionFlag = () => {
    const newFlagId = descriptionFlags.length + 1;
    const newFlags = descriptionFlags.slice();
    newFlags.splice(0, 0, newFlagId);

    setDescriptionFlags(newFlags);
  };

  const newCommentFlag = () => {
    const newFlagId = commentFlags.length + 1;
    const newFlags = commentFlags.slice();
    newFlags.splice(0, 0, newFlagId);

    setCommentFlags(newFlags);
  };

  useEffect(() => {
    if (select()) {
      if (area.toLowerCase().includes(select().toLowerCase())) {
        changeSelectedText(finalTranscript, setArea, area)
        resetTranscript()
      }
    } else if (finalTranscript) {
      insertText(finalTranscript)
      resetTranscript()
    }

  }, [finalTranscript])

  useEffect(() => {
    view.getContext().then(data => setContext(data.extension.issue.key));
  }, []);


  function insertText(text) {
    let val = textareaInput.current.value;
    let start = textareaInput.current.selectionStart, end = textareaInput.current.selectionEnd;
    const inserted = ` ${firstSymbol(text)}. `
    setArea(textareaInput.current.value = val?.slice(0, start) + inserted + val?.slice(end))
    textareaInput.current.focus();
    let caretPos = start + inserted.length;
    textareaInput.current.setSelectionRange(caretPos, caretPos);
  }

  return (
    <Fragment>
      <div className="buttonWrapper">
        <div className="btnContainer">

          <Tooltip content={listening ? 'Stop dictation' : 'Click to start dictate'}>
            {(tooltipProps) => (
              <div
                {...tooltipProps}
                className="recordBtn"
                style={{
                  backgroundColor: listening ? '#e41a1a' : '',
                  color: listening ? 'white' : '',
                }}
                onClick={() => handleListing(setIsListening, SpeechRecognition, listening)}>
                <VidAudioOnIcon className="micro" label=""/>
              </div>
            )}
          </Tooltip>

          <Button isDisabled={!area} onClick={openModal}>Clear</Button>

          <Tooltip content="Text below will be appended to description">
            {(tooltipProps) => (
              <Button isDisabled={!area} {...tooltipProps}
                      onClick={() => setDescription(area, context, newDescriptionFlag)}>
                Append to Description
              </Button>
            )}
          </Tooltip>

          <Tooltip content="A comment will be created from the text below">
            {(tooltipProps) => (
              <Button isDisabled={!area} {...tooltipProps} onClick={() => createComment(area, context, newCommentFlag)}>
                Create comment
              </Button>
            )}
          </Tooltip>
        </div>

        <Tooltip content="Help">
          {(tooltipProps) => (
            <div {...tooltipProps} className="btnContainer">
              <div onClick={() => {
                router.open('https://saasjet.atlassian.net/wiki/spaces/SAASJET/pages/2448523294/Dictation+for+Jira');
              }} className="helpBtn">
                <QuestionCircleIcon label=""/>
              </div>
            </div>
          )}
        </Tooltip>

      </div>
      <TextArea
        appearance="standard"
        placeholder="Enter your text here using keyboard or microphone"
        value={area}
        ref={textareaInput}
        onChange={(e) => setArea(e.target.value)}
      />

      <ClearModal handleReset={() => handleReset(resetTranscript, setArea)} isOpen={isOpen} setIsOpen={setIsOpen}/>
      <Flag setFlags={setDescriptionFlags} flags={descriptionFlags} action={'Description updated'}/>
      <Flag setFlags={setCommentFlags} flags={commentFlags} action={'Comment created'}/>
    </Fragment>
  );
}

export default App;
