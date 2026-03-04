import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { PrivateAxios } from '../../environment/AxiosInstance';
import { SuccessMessage } from '../../environment/ToastMessage';
import SettingsPageTopBar from './SettingsPageTopBar';

function OfficeTiming() {
  const [startTime, setStartTime] = useState(false);
  const [endTime, setEndTime] = useState(false);
  const [officeTime, setOfficeTime] = useState({
    'start': "",
    'end': "",
    'workingDay': [],
  });

  const getOfficeTime = async () => {
    PrivateAxios.get("office-time")
      .then((res) => {
        setOfficeTime({ ...officeTime, start: res.data.data.start_time, end: res.data.data.end_time, workingDay: JSON.parse(res.data.data.working_days) })
      }).catch((err) => {
        console.log(err);
      })
  }
  useEffect(() => {
    getOfficeTime();
  }, [])
  const week = [
    { value: '0', name: 'Sunday' },
    { value: '1', name: 'Monday' },
    { value: '2', name: 'Tuesday' },
    { value: '3', name: 'Wednesday' },
    { value: '4', name: 'Thursday' },
    { value: '5', name: 'Friday' },
    { value: '6', name: 'Saturday' }
  ];
  let i = 0
  const handleStartClick = () => {
    setStartTime(true);
  };

  const handleStartChange = (event) => {
    setOfficeTime({ ...officeTime, start: event.target.value });
  };

  const handleStartBlur = () => {
    i = 0;
    setStartTime(false);
    submit(officeTime)
  };

  const handleEndClick = () => {
    setEndTime(true);
  };

  const handleEndChange = (event) => {
    setOfficeTime({ ...officeTime, end: event.target.value });
  };

  const handleEndBlur = () => {
    i = 0;
    setEndTime(false);
    submit(officeTime);
  };

  const handleWeekChange = (event) => {
    i = 0;
    const { value, checked } = event.target;
    setOfficeTime(prevState => {
      let updatedWorkingDays = [...prevState.workingDay];
      if (checked) {
        if (!updatedWorkingDays.includes(value)) {
          updatedWorkingDays.push(value);
        }
      } else {
        updatedWorkingDays = updatedWorkingDays.filter(day => day !== value);
      }
      updatedWorkingDays.sort((a, b) => a - b);
      const updatedState = { ...prevState, workingDay: updatedWorkingDays };
      submit(updatedState);
      return updatedState;
    });
  };

  const submit = (data) => {
    PrivateAxios.post("office-time/change", data)
      .then((res) => {
        if (i == 0) {
          SuccessMessage(res.data.message)
        }
        i++;
        return
      }).catch((err) => {
        console.log(err);
      })

  }

  return (
    <>
      <SettingsPageTopBar />
      <div className='p-4'>
        <div className='card col-12 col-md-12 m-auto'>
          <div className='card-header'>
            <div>
              <label>Open Time</label>
              {startTime ? (
                <input
                  type="time"
                  name="start_time"
                  className="form-control float-end w-auto"
                  value={officeTime.start}
                  onChange={handleStartChange}
                  onBlur={handleStartBlur}
                  autoFocus
                />
              ) : (
                <span className="float-end border-bottom" onClick={handleStartClick}>
                  {moment(officeTime.start, 'HH:mm:ss').format('hh:mm A')}
                </span>
              )}
            </div>
            <hr />
            <div>
              <label>Close Time</label>
              {endTime ? (
                <input
                  type="time"
                  name="end_time"
                  className="form-control float-end w-auto"
                  value={officeTime.end}
                  onChange={handleEndChange}
                  onBlur={handleEndBlur}
                  autoFocus
                />
              ) : (
                <span className="float-end border-bottom" onClick={handleEndClick}>
                  {moment(officeTime.end, 'HH:mm:ss').format('hh:mm A')}
                </span>
              )}
            </div>
            <hr />
            <div>
              <label>First Day of Week</label>
              <p className='float-end'>{officeTime.workingDay.length > 0 ? week[officeTime.workingDay[0]].name : ""}</p>
            </div>
            <hr />
            <div>
              <label>Working Days</label>
              <span className='float-end text-end'>
                {week.map((data) => (
                  <label key={data.value} className="custom-checkbox me-2 mb-2">
                    <input
                      type='checkbox'
                      value={data.value}
                      checked={officeTime.workingDay.includes(data.value)}
                      className="form-check-input me-1"
                      onChange={handleWeekChange}
                    />
                    <span className="checkmark" />
                    <span className="text-">{data.name}</span>

                  </label>
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OfficeTiming;
