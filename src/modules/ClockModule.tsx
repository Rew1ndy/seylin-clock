
export default function ClockModule(data : {time: string, handleEventOption: (event: any) => void}) {
    return (
        <div className="timeModule">
        <div 
          className="block-left glass-left glass unselectable"
          onClick={data.handleEventOption}
          id="left-button"
        ></div>
        <div 
          className="block-mid glass-mid glass unselectable"
          onClick={data.handleEventOption}
          id="mid-button"
        ></div>
        <div 
          className="block-right glass-right glass unselectable"
          onClick={data.handleEventOption}
          id="right-button"
        ></div>
        <p className="time-stamp unselectable">{data.time}</p>
      </div>
    )
}