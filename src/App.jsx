import { useState, useEffect, useRef } from "react";
import "./App.css";
import {
  formatTime,
  showBreakTime,
  showActiveTime,
  isValidWorkingTime,
} from "./utils/date";

function App() {
  const [isBreak, setIsBreak] = useState(false);
  const [isSignedIn, setSignedIn] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date().getTime());
  const [signInTime, setSignInTime] = useState(null);
  const [signOutTime, setSignOutTime] = useState(null);
  const [breakTimes, setBreakTimes] = useState([]);

  const currentTimer = useRef();

  const [error, setError] = useState("");

  useEffect(() => {
    // -- Runs only on mount --

    const storageSignInTime = localStorage.getItem("signInTime");
    const storageSignOutTime = localStorage.getItem("signOutTime");
    const storageBreakTimes = localStorage.getItem("breakTimes");

    // set sign in and sign out times from localStorage
    if (storageSignInTime) {
      setSignInTime(parseInt(storageSignInTime));
    }
    if (storageSignOutTime) {
      setSignOutTime(parseInt(storageSignOutTime));
    }
    if (storageBreakTimes) {
      const parsedBreakTimes = JSON.parse(storageBreakTimes);
      setBreakTimes(parsedBreakTimes);

      if (!parsedBreakTimes.length) {
        // there are no breaks present, user is not on a break
        setIsBreak(false);
      } else {
        // breaks are present
        // get last break tuple
        const lastBreak = parsedBreakTimes[parsedBreakTimes.length - 1];

        // if last break is incomplete, user is on a break
        if (lastBreak[1] === 0) {
          setIsBreak(true);
        } else {
          // if last break is complete, user is not on a break
          setIsBreak(false);
        }
      }
    }

    // set user's signed in status
    if (storageSignInTime && !storageSignOutTime) {
      setSignedIn(true);
    } else if (storageSignInTime && storageSignOutTime) {
      setSignedIn(false);
    }

    startCurrentTimer();
    return () => {
      stopCurrentTimer();
    };
  }, []);

  const startCurrentTimer = () => {
    if (currentTimer.current) {
      clearInterval(currentTimer.current);
    }
    currentTimer.current = setInterval(() => {
      setCurrentTime((time) => {
        return time + 1000;
      });
    }, 1000);
  };

  const stopCurrentTimer = () => {
    if (currentTimer.current) {
      clearInterval(currentTimer.current);
    }
  };

  const handleBreak = () => {
    setError("");

    if (!isValidWorkingTime()) {
      setError("You cannot take a break outside of work hours!");
      return;
    }

    const now = new Date().getTime();

    if (!breakTimes.length) {
      // there are no breaks present, create a new break
      setBreakTimes([[now, 0]]);
      localStorage.setItem("breakTimes", JSON.stringify([[now, 0]]));
    } else {
      // breaks are present
      const breaks = [...breakTimes];

      // get last break tuple
      const lastBreak = breaks[breaks.length - 1];

      // if last break is incomplete
      if (lastBreak[1] === 0) {
        lastBreak[1] = now;
      } else {
        // if last break is complete, create a new break
        breaks.push([now, 0]);
      }
      setBreakTimes(breaks);
      localStorage.setItem("breakTimes", JSON.stringify(breaks));
    }

    setIsBreak(!isBreak);
  };

  const handleSignIn = () => {
    setError("");

    if (!isValidWorkingTime()) {
      setError("You cannot sign in outside of work hours!");
      return;
    }

    // do not sign in if already signed in
    if (signInTime) {
      setError("You cannot sign in again!");
      return;
    }

    // capture current time
    const now = new Date().getTime();

    setSignInTime(now);
    localStorage.setItem("signInTime", now);
    setSignedIn(true);
  };

  const handleSignOut = () => {
    setError("");

    if (!isValidWorkingTime()) {
      setError("You cannot sign out outside of work hours!");
      return;
    }

    // capture current time
    const now = new Date().getTime();

    setSignOutTime(now);
    localStorage.setItem("signOutTime", now);
    setSignedIn(false);

    // if break is running, this will stop the break while signing out
    if (isBreak) {
      handleBreak();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="font-bold text-3xl">Time tracker</div>
      <div className="grid grid-cols-2 gap-x-24 gap-y-4 justify-center">
        <div>Current Time:</div>
        <div>{formatTime(currentTime)}</div>

        <div>Signin Time:</div>
        <div>{formatTime(signInTime)}</div>

        <div>Signout Time:</div>
        <div>{formatTime(signOutTime)}</div>

        <div>Active Time:</div>
        <div>
          {showActiveTime(currentTime, signInTime, signOutTime, breakTimes)}
        </div>

        <div>Break Time:</div>
        <div>
          {showBreakTime(currentTime, signInTime, signOutTime, breakTimes)}
        </div>
      </div>
      <div className="flex flex-col gap-3 justify-center  mt-8">
        <button
          disabled={isSignedIn}
          onClick={handleSignIn}
          className={`${
            isSignedIn
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-green-100 text-green-800"
          }`}
        >
          Sign In
        </button>
        <button
          disabled={!isSignedIn}
          onClick={handleSignOut}
          className={`${
            !isSignedIn
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-red-100 text-red-800"
          }`}
        >
          Sign Out
        </button>
        {isSignedIn && (
          <button
            onClick={handleBreak}
            className={`${
              isBreak
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {isBreak ? "Resume work" : "Take a break"}
          </button>
        )}
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="bg-purple-100 text-purple-800"
        >
          Clear Records
        </button>
      </div>

      {error && (
        <div className="relative mt-8 bg-amber-200 text-amber-600 p-4 rounded-lg">
          {error}
          <div
            onClick={() => setError("")}
            className="h-8 w-8 cursor-pointer bg-amber-300 rounded-full flex items-center justify-center absolute -right-2 top-0 -translate-y-1/2 text-amber-600"
          >
            x
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
