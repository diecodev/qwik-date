import { component$, useSignal } from '@qwik.dev/core';
import { Calendar, DatePicker } from '../lib';
import { Case, Demo, Steps } from './ui';

export const FormCases = component$(() => {
  const submitted = useSignal('');
  const picked = useSignal('');

  return (
    <>
      <Case
        id='form-calendars'
        title='Calendars in a form'
        tests={['name submits the value with the form, empty without one', 'the submitted value follows the choices']}
      >
        <Steps>
          <li>
            <p>
              Click <b>Submit</b>. The calendars are rendered with name="day" (value 2024-08-15) and name="stay"
              (mode="range", Aug 5 to Aug 12).
            </p>
            <p>
              The form sends <b>day=2024-08-15&amp;stay[start]=2024-08-05&amp;stay[end]=2024-08-12</b>: a hidden input
              per value, two for a range.
            </p>
          </li>
          <li>
            <p>
              Click <b>20</b> in the first calendar, <b>18</b> and <b>22</b> in the second, then <b>Submit</b>.
            </p>
            <p>
              <b>day=2024-08-20&amp;stay[start]=2024-08-18&amp;stay[end]=2024-08-22</b>. Between the two clicks of the
              range, stay[end] is empty.
            </p>
          </li>
        </Steps>
        <Demo>
          <form
            preventdefault:submit
            onSubmit$={(_, form) => {
              submitted.value = [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join('&');
            }}
            class='pg-row'
          >
            <Calendar name='day' value='2024-08-15' />
            <Calendar name='stay' mode='range' value={{ start: '2024-08-05', end: '2024-08-12' }} />
            <button type='submit' class='pg-button'>
              Submit
            </button>
          </form>
          <p class='pg-probe'>
            submitted: <output>{submitted.value || 'nothing yet'}</output>
          </p>
        </Demo>
      </Case>

      <Case id='form-picker' title='A DatePicker in a form' tests={['a DatePicker submits its value too']}>
        <Steps>
          <li>
            <p>
              Click <b>Submit</b>: the DatePicker is rendered with name="picked" and no value.
            </p>
            <p>
              <b>picked=</b>, empty.
            </p>
          </li>
          <li>
            <p>
              Open it, choose the 1st, then click <b>Submit</b>.
            </p>
            <p>
              <b>picked=</b> followed by that day, as YYYY-MM-DD.
            </p>
          </li>
        </Steps>
        <Demo>
          <form
            preventdefault:submit
            onSubmit$={(_, form) => {
              picked.value = [...new FormData(form)].map(([key, value]) => `${key}=${value}`).join('&');
            }}
            class='pg-row'
          >
            <DatePicker name='picked' />
            <button type='submit' class='pg-button'>
              Submit
            </button>
          </form>
          <p class='pg-probe'>
            submitted: <output>{picked.value || 'nothing yet'}</output>
          </p>
        </Demo>
      </Case>
    </>
  );
});
