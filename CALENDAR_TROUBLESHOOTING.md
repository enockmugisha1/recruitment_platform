# Calendar Troubleshooting Guide 🔧

## Issue: Calendar event scheduling not working

### Quick Checks:

#### 1. Check if Modal Opens
When you click "Schedule Event" button:
- ✅ Modal should appear
- ✅ Form should be visible
- ❌ If modal doesn't appear, check console

#### 2. Open Browser Console (F12)
Look for errors:
```javascript
// Expected logs when clicking "Schedule Event":
// None - should just open modal

// When submitting form:
🔑 Token added to request: /access/calendar-events/

// If you see errors:
❌ "No token found" - You need to login
❌ "Network Error" - Backend not running
❌ "403 Forbidden" - Not logged in as recruiter
```

#### 3. Check Backend is Running
```bash
# Make sure Django is running:
python manage.py runserver

# Test the endpoint:
curl http://localhost:8000/access/calendar-events/
# Should return: {"detail":"Authentication credentials were not provided."}

# Test with token:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/access/calendar-events/
# Should return: [] or list of events
```

#### 4. Check Login Status
```javascript
// In browser console:
localStorage.getItem('accessToken')

// Should return something like:
"eyJ0eXAiOiJKV1QiLCJhbGc..."

// If null, login again
```

#### 5. Check User Role
```bash
# In Django shell:
python manage.py shell
>>> from users.models import User
>>> user = User.objects.get(email='your@email.com')
>>> user.role
'recruiter'  # Must be 'recruiter', not 'job_seeker'
```

## Step-by-Step Testing

### Test 1: Can you open the modal?

1. Go to: `http://localhost:5173/calendar`
2. Click the blue "Schedule Event" button (top right)
3. **Does the modal appear?**
   
   **YES** → Go to Test 2
   **NO** → See "Modal Not Appearing" section below

### Test 2: Can you fill the form?

1. Modal is open
2. Try filling in:
   - Event Type: Interview
   - Title: "Test Event"
   - Date: Tomorrow
   - Time: 14:00
3. **Can you type in all fields?**
   
   **YES** → Go to Test 3
   **NO** → Fields might be disabled, check console

### Test 3: Can you submit?

1. Fill in required fields (Title, Date, Time, Type)
2. Click "Schedule Event" button
3. **What happens?**
   
   **Success message** → ✅ Working!
   **Error message** → See error section
   **Nothing** → Check console for errors

## Common Issues & Fixes

### Issue 1: Modal Not Appearing

**Symptoms**: Click "Schedule Event" but nothing happens

**Possible Causes**:
1. JavaScript error
2. Z-index issue (modal behind other elements)
3. React state not updating

**Solutions**:

A. Check Console (F12):
```javascript
// Look for errors like:
Uncaught TypeError: ...
Uncaught ReferenceError: ...
```

B. Try clicking the calendar date first:
- Click on a date in the calendar
- Then click "Schedule Event"
- Does modal open now?

C. Check if showModal state is changing:
```javascript
// Add this to Calendar.tsx temporarily:
console.log('showModal:', showModal);
```

D. Hard refresh:
- Press Ctrl+Shift+R (Windows/Linux)
- Press Cmd+Shift+R (Mac)

### Issue 2: "Failed to create event"

**Symptoms**: Modal submits but shows error

**Check**:
1. Backend logs:
```bash
# Watch Django logs:
python manage.py runserver
# Look for POST /access/calendar-events/ requests
```

2. Network tab in browser (F12):
- Go to Network tab
- Click "Schedule Event"
- Look for request to `calendar-events`
- Click on it to see:
  - Request payload
  - Response

**Common Errors**:

A. **401 Unauthorized**:
```json
{"detail": "Authentication credentials were not provided."}
```
**Fix**: Login again

B. **403 Forbidden**:
```json
{"detail": "You do not have permission to perform this action."}
```
**Fix**: Login as recruiter, not job seeker

C. **400 Bad Request**:
```json
{
  "date": ["Event date cannot be in the past."]
}
```
**Fix**: Select a future date

D. **400 Bad Request**:
```json
{
  "title": ["This field is required."]
}
```
**Fix**: Fill in all required fields

### Issue 3: Event Created But Not Showing

**Symptoms**: Success message but event not on calendar

**Solutions**:

A. Refresh the page:
- Press F5

B. Check if event is in database:
```bash
python manage.py shell
>>> from applications.models import CalendarEvent
>>> CalendarEvent.objects.all()
# Should show your events
```

C. Check if you're looking at the right month:
- Events might be in a different month
- Click "Today" button to go to current month

D. Check event date:
```bash
>>> from applications.models import CalendarEvent
>>> for e in CalendarEvent.objects.all():
...     print(e.title, e.date)
```

### Issue 4: Wrong Date/Time

**Symptoms**: Event appears on wrong date or time

**Cause**: Timezone issue

**Fix**:
The backend stores in UTC, frontend shows in local time. This is normal.

To verify:
```bash
>>> from applications.models import CalendarEvent
>>> e = CalendarEvent.objects.first()
>>> e.date
datetime.datetime(2025, 12, 20, 14, 30, tzinfo=datetime.timezone.utc)
```

### Issue 5: Cannot Delete Events

**Symptoms**: Click trash icon but event not deleted

**Check**:
1. Console for errors
2. Network tab for DELETE request
3. Backend permissions

**Fix**:
```bash
# Check if user owns the event
python manage.py shell
>>> from applications.models import CalendarEvent
>>> e = CalendarEvent.objects.first()
>>> e.recruiter.user.email
# Should match your logged-in email
```

## Manual Testing with Curl

### Create Event:
```bash
# Get your token first
TOKEN="your_access_token_here"

# Create event
curl -X POST http://localhost:8000/access/calendar-events/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Interview",
    "event_type": "interview",
    "date": "2025-12-25T14:30:00",
    "location": "Office",
    "description": "Test event"
  }'

# Should return:
{
  "id": 1,
  "title": "Test Interview",
  ...
}
```

### List Events:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/access/calendar-events/

# Should return array of events
```

### Delete Event:
```bash
curl -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/access/calendar-events/1/

# Should return 204 No Content
```

## Debug Mode

### Add Console Logs:

**In Calendar.tsx**:
```typescript
const handleScheduleInterview = async (eventData: any) => {
  console.log('Creating event with data:', eventData);
  try {
    await calendarService.createEvent(eventData);
    console.log('Event created successfully!');
    toast.success('Event created successfully!');
    setShowModal(false);
    fetchEvents();
  } catch (error: any) {
    console.error('Error creating event:', error);
    console.error('Error response:', error.response?.data);
    toast.error(error.response?.data?.detail || 'Failed to create event');
  }
};
```

**In ScheduleInterviewModal.tsx**:
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  console.log('Form submitted with:', formData);
  
  setLoading(true);
  
  try {
    const dateTime = `${formData.date}T${formData.time}:00`;
    console.log('Combined datetime:', dateTime);
    
    const eventData = {
      title: formData.title,
      event_type: formData.event_type,
      date: dateTime,
      location: formData.location || '',
      description: formData.description || '',
      candidate: formData.candidate_id ? parseInt(formData.candidate_id) : null,
    };
    
    console.log('Sending event data:', eventData);
    await onSchedule(eventData);
    console.log('Event scheduled successfully!');
    
    // ... rest of code
  } catch (err: any) {
    console.error('Submit error:', err);
    console.error('Error details:', err.response?.data);
    // ... rest of code
  }
};
```

## What Should Happen (Normal Flow)

### Step 1: Click "Schedule Event"
- Button click triggers: `setShowModal(true)`
- Modal component renders
- Form is empty and ready

### Step 2: Fill Form
- Type in Title: "Interview with John"
- Select Type: Interview
- Select Date: Tomorrow
- Select Time: 14:00
- Optional: Location, Description

### Step 3: Click "Schedule Event" (in modal)
- Form submits
- Console logs: "Creating event with data: {...}"
- Console logs: "🔑 Token added to request: /access/calendar-events/"
- Backend creates event
- Response received: `{id: 1, title: "Interview with John", ...}`
- Toast shows: "Event created successfully!"
- Modal closes
- Events refetch
- New event appears on calendar

## Still Not Working?

### Checklist:
- [ ] Backend running (`python manage.py runserver`)
- [ ] Frontend running (`npm run dev`)
- [ ] Logged in as recruiter
- [ ] Token in localStorage
- [ ] No console errors
- [ ] Modal opens when clicking button
- [ ] Form fields are fillable
- [ ] Network tab shows request
- [ ] Backend shows no errors

### Get Help:
If all above checks pass but still not working:

1. **Share Console Errors**:
   - Open Console (F12)
   - Screenshot any red errors

2. **Share Network Response**:
   - Open Network tab (F12)
   - Click "Schedule Event"
   - Find the POST request
   - Screenshot the response

3. **Share Backend Logs**:
   - From terminal where Django is running
   - Copy the logs when you submit

4. **Test with Curl**:
   - Run the manual curl commands above
   - Share the response

## Quick Fix Commands

```bash
# 1. Restart backend
# Ctrl+C to stop, then:
python manage.py runserver

# 2. Clear browser cache and reload
# In browser: Ctrl+Shift+R

# 3. Check migrations
python manage.py makemigrations
python manage.py migrate

# 4. Create test event directly in database
python manage.py shell
>>> from applications.models import CalendarEvent
>>> from profiles.models import RecruiterProfile
>>> from datetime import datetime, timedelta
>>> recruiter = RecruiterProfile.objects.first()
>>> CalendarEvent.objects.create(
...     recruiter=recruiter,
...     title="Test Event",
...     event_type="meeting",
...     date=datetime.now() + timedelta(days=1)
... )
# Then refresh calendar page

# 5. Rebuild frontend
cd Application-analyzer
npm run build
npm run dev
```

## Success Indicators

✅ Modal opens smoothly
✅ Form fields accept input
✅ Submit button shows "Scheduling..." then closes modal
✅ Success toast appears
✅ Event appears on calendar
✅ Event saved in database
✅ Can delete event
✅ No console errors

---

**Last Updated**: 2025-12-19
**Status**: Debugging Guide
**Purpose**: Help identify and fix calendar issues
