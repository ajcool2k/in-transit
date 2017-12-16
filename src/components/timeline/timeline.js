import { h, Component } from 'preact';
import { connect } from 'preact-redux';

import AxisX from './axis_x';
import AxisY from './axis_y';
import Swimlane from './swimlane';
import { dataLoad } from '../../lib/reducers/data';
import { zoomActions } from '../../lib/reducers/zoom';

const NS_SVG = 'http://www.w3.org/2000/svg';
const NS_XHTML = 'http://www.w3.org/1999/xhtml';


class Timeline extends Component {
  constructor () {
    super();
    this.setState({
      dragging: false,
    });
  }

  componentDidMount() {
    let timeSorted = this.props.data.process.childs.sort(
      (a,b) => { return new Date(a.start) - new Date(b.start) }
    );
    this.props.setZoomBase(timeSorted[0].start, timeSorted[timeSorted.length-1].start);

    if (!this.resize) {
      this.resize = () => {
        const { beginning, end, setZoomSection } = this.props;
        setZoomSection(0, 0);
      };
      window.addEventListener('resize', this.resize)
    }
  }

  componentWillUnmount() {
    if (this.resize) {
      window.removeEventListener('resize', this.resize)
      this.resize = undefined;
    }
  }

  onMouseWheel = ({ beginning, end, setZoomSection }, tlWidth) => event => {
    event.preventDefault();

    let distance = event.deltaY * (end.getTime() - beginning.getTime()) / 1000;
    let a1 = event.offsetX / tlWidth;
    setZoomSection(- a1 * distance, (1 - a1) * distance);
  }

  onMouseMove = ({ beginning, end, setZoomSection }, tlWidth) => event => {
    if (!this.state.dragging) return;
    event.preventDefault();

    let distance = event.movementX / tlWidth * (beginning.getTime() - end.getTime());
    setZoomSection(distance, distance);
  }

  onMouseDown = () => {
    this.setState({ dragging: true });
  }

  onMouseUp = () => {
    this.setState({ dragging: false });
  }

  render () {
   const { beginning, end, steps, process, filter } = this.props;
   const yAxisWidth = 33;
   let swimlanes = process.process.stakeholder;
   let allProcesses = process.process.childs;
   let swimlaneheight = this.props.height / swimlanes.length;

   swimlanes.forEach( function(lane){
      lane.processes = allProcesses.filter( function(process){
        if(filter.processMapping == "Initiator")
          return process.initiator == lane.id;
        else return process.participants.indexOf(lane.id) > -1;
        });
      return lane;
      });
    let tlHeight = this.props.height;
    let tlWidth = window.innerWidth;
    let viewBox = "0 0 "+window.innerWidth+" "+tlHeight;

    if(filter.laneWrap)
        swimlanes = swimlanes.filter((lane) => {
          return lane.processes.length  > 0
          })

    const onWheel = this.onMouseWheel(this.props, tlWidth);
    return (
      <svg  xmlns={NS_SVG} version='1.1' viewBox={viewBox}  preserveAspectRatio='xMidYMid slice' >
        <rect id="timeline_bg" x="0" y="0" width={tlWidth} height={tlHeight} style="fill:#95DAE7" />
        <g
          onMouseWheel={onWheel}
          onwheel={onWheel}
          onMouseDown={this.onMouseDown}
          onMouseUp={this.onMouseUp}
          onMouseMove={this.onMouseMove(this.props, tlWidth).bind(this)}
        >
        {
          swimlanes.map(
          (lane,index) => (
            <Swimlane id = {lane.id}
                      title = {lane.name}
                      x = {yAxisWidth}
                      y = {20 + (swimlaneheight * parseInt(index))}
                      width = {tlWidth-yAxisWidth}
                      height = {swimlaneheight}
                      processes = {lane.processes}
                      stakeholder = {process.process.stakeholder}
                      />
          ))
        }
        </g>
        <AxisY x="0" y="0" height={tlHeight} width={yAxisWidth} />
        <AxisX x={yAxisWidth} y="0" width={tlWidth-yAxisWidth}
          onWheel={onWheel} showAxisLabels={true}
        />
      </svg>
    );
  }
}

const mapStateToProps = ({ zoom, filter, data }) => ({
  beginning: zoom.sectionStart,
  end: zoom.sectionEnd,
  filter,
  data: data.data,
});
const mapDispatchToProps = dispatch => ({
  setZoomSection: (begin, end) => dispatch(zoomActions.setZoomSection(begin, end)),
  setZoomBase: (start, end) => dispatch(zoomActions.setZoomBase(start, end)),
  loadData: dataLoad(dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
