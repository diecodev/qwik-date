import { component$, useSignal } from '@qwik.dev/core';
import { Calendar } from '../lib';
import { Case, Demo, Steps } from './ui';

export const FormCases = component$(() => {
  const submitted = useSignal('');

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
              Click <b>Submit</b>. The calendars are rendered with name="day" (value 2024-08-15), name="stay"
              (mode="range", Aug 5 to Aug 12) and name="none" (no value).
            </p>
            <p>
              The form sends <b>day=2024-08-15&amp;stay[start]=2024-08-05&amp;stay[end]=2024-08-12&amp;none=</b>: a
              hidden input per value, two for a range, empty without a value.
            </p>
          </li>
          <li>
            <p>
              Click <b>20</b> in the first calendar, <b>18</b> and <b>22</b> in the second, then <b>Submit</b>.
            </p>
            <p>
              <b>day=2024-08-20&amp;stay[start]=2024-08-18&amp;stay[end]=2024-08-22&amp;none=</b>. Between the two
              clicks of the range, stay[end] is empty.
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
            <Calendar name='none' />
            <button type='submit' class='pg-button'>
              Submit
            </button>
          </form>
          <p class='pg-probe'>
            submitted: <output>{submitted.value || 'nothing yet'}</output>
          </p>
        </Demo>
      </Case>
    </>
  );
});
