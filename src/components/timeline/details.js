import { h } from 'preact';
import { connect } from 'preact-redux';
import moment from 'moment';
import style from './details.css';

import { selectionActions } from '../../lib/reducers/selection';

const MOMENT_FORMAT = "D.M.Y";

function LocationDetail({ room, address, zip, city }) {
  return (
    <li>
      { room }
      { address }
      { zip } { city }
    </li>
  );
}

function DetailsOverlay({ data, selected, hover, unhover, select }) {
  if (!selected) {
    return <div id='overlay' class={style.overlayHidden}></div>;
  }
  const processes = data.process ?
        [data.process]
        .concat(data.process.childs) :
        [];
  const process = processes
        .filter(({ id }) => id == selected)
        [0];
  if (!process) {
    return <div id='overlay' class={style.overlayHidden}></div>;
  }
  console.log('DetailsOverlay', process);
  const getProcessById = processId =>
        processes.filter(({ id }) => id == processId)
        [0];
  const parent = process.parent &&
        getProcessById(process.parent);

  const getLocationById = loc =>
        data.process.locations
        .filter(({ id }) => id == loc)
        [0];

  // Captures select, hover, unhover from DetailsOverlay closure
  function ProcessLink({ id, name }) {
    const click = ev => {
      // Don't follow a/@href
      ev.preventDefault();

      select(id);
    };
    return <a href="#"
        onclick={click}
        onmouseenter={() => hover(id)}
        onmouseleave={() => unhover(id)}
      >
        { name }
      </a>;
  }
  function ProcessList({ title, list }) {
    if (list.length == 0) {
      return null;
    }

    return (
      <div>
        <h3>{ title }</h3>
        <ul>
          { list.map(
            p => (
              <li>
                <ProcessLink { ...getProcessById(p) }/>
              </li>
            )
          )}
        </ul>
      </div>
    );
  }

  const start = process.start &&
        moment(process.start).format(MOMENT_FORMAT);
  const end = process.end &&
        moment(process.end).format(MOMENT_FORMAT);
  const timeText = (start && end) ?
        start + " -\n" + end :
        start ?
        start :
        end;

  return (
    <div id='overlay' class={style.overlay}>
      <div class={style.titlebar}>
        <h2>{ process.name }</h2>
        { timeText && <p class={style.time}>{ timeText }</p>}
      </div>
      { parent &&
        <p>
          { "Übergeordnet: " }
          <ProcessLink { ...parent }/>
        </p>
      }
      <ProcessList title="Vorläufer"
        list={ process.connection.from }/>
      <ProcessList title="Nachfolgend"
        list={ process.connection.to }/>
      <h3>Orte</h3>
      <ul>
        { process.location.map(
            loc => <LocationDetail { ...getLocationById(loc) }/>
          )}
      </ul>
    </div>
  );
}

const mapStateToProps = ({ selection, data }) => ({
  selected: selection.selected,
  data: data.data,
});
const mapDispatchToProps = dispatch => ({
  hover: value => dispatch(selectionActions.hover(value)),
  unhover: value => dispatch(selectionActions.unhover(value)),
  select: value => dispatch(selectionActions.select(value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DetailsOverlay);
