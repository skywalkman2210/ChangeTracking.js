# ChangeTracking.js

ChangeTracking.js is a simple library to track changes on a form. It supports both Vanilla JavaScript and jQuery. Of course changes and pull requests are always welcome!

## To Begin

Create your simple HTML Form. Then use the JQuery selector and call useTracking on it.

```html
<form id="TrackedForm"></form>
<script>
    $('#TrackedForm').useTracking();
</script>
```

Optionally, you can skip the JQuery Extended function. However, you will have to pass the form as the target.

```html
<form id="TrackedForm"></form>
<script>
    var form = element.getElementById('TrackedForm');

    // Have to pass form as target. 
    // JQuery Extender does this behind the scenes.
    useTracking({
        target: form
    })
</script>
```

## Options

Current support for options is limited. More could be added, but these options should cover most cases.

```javascript
{
    target: form, // The form DOM element. Not required with JQuery Extender
    onSubmit: function (newObject, originalObject, changes) {
        // Control submission based on object.
        // If onSubmit is not defined, will always return true.
    },
    onTrack: function (trackedChanges, originalObject) {
        // Do something when a change has been made.
        // Changes will still be tracked with this function defined.
    }
}
```

## Using Change Tracking

Change Tracking will happen to all inputs and selects in the DOM under the form. You have to define which property it should be built to. To build the object, you can use dot notation to put properties into objects.

```html
    <input type="text" name="first" id="first" data-prop="user.first" >
    <input type="text" name="last" id="last" data-prop="user.last" >
    <input type="password" name="password" id="password" data-prop="password" >

    <!-- 
        Change Tracking object will look like the following:
        {
            password: "",
            user: {
                first: "",
                last: ""
            }
        }
    -->
```

You can have an input or select that you do not want to track. To define the field as no tracked, add the 'notracking' attribute.

```html
    <!-- Will not be tracked -->
    <input type="text" name="id" id="id" notracking>
```