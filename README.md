<div align="center">
    <h1>Data Card for Spotify</h1>
    <a href="https://www.data-card-for-spotify.com">
      <img src="docs/basic.svg" alt="Data Card for Spotify">
    </a>
    <br>
    <br>
    <p>Dynamically generated Spotify data to embed in your README or website</p>
    <br>
</div>

## Table of Contents

- [Generating a Data Card](#generating-a-data-card)
- [Embedding with Markdown](#embedding-with-markdown)
- [Customization](#customization)
  - [Examples](#examples)
- [Known Issues](#known-issues)
- [Credits](#credits)
- [License](#license)

## Generating a Data Card

To generate your own data card, simply navigate to [the website](https://www.data-card-for-spotify.com) and click the "Generate Card" button. This will prompt you to log in to your Spotify account and allow the service to access your Spotify account data and activity. After clicking "Agree" your data card will be generated.

On the home page, you can click the "Copy Code" button to copy the HTML which you would then paste into your README.md file or website code to embed the data card. You can also click the "Full Card View" button to view the "card page," which displays an interactive version of your data card.

## Embedding with Markdown

Most markdown applications should be able to render the HTML copied by the "Copy Code" button. If this isn't the case or if you'd prefer to use Markdown instead of HTML, you can convert the HTML to Markdown like so:

Change

```md
<a href="card_page_link">
  <img src="card_image_link" alt="Data Card for Spotify">
</a>
```

to

```md
[![Data Card for Spotify](card_image_link)](card_page_link)
```

## Customization

You can customize the data that's shown on your data card with URL parameters. These are all the possible customization options:

- `show_border` - _(boolean)_ whether or not to show a white border around the data card; default value: `false`

- `show_date` - _(boolean)_ whether or not to show the date and time that the data card was generated; default value: `false`

- `time_zone` - _(string)_ the time zone to use when `show_date` is set to true; example: `America/Los_Angeles` ([full list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)); default value: `UTC`

- `custom_title` - _(string)_ a custom title to use for the data card; must be [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding) which can be done with an online tool like [urlencoder.org](https://www.urlencoder.org); default value: none

- `hide_title` - _(boolean)_ whether or not to hide the title; default value: `false`

- `hide_explicit` - _(boolean)_ whether or not to hide explicit tracks from all sections; default value: `false`

- `hide_playing` - _(boolean)_ whether or not to hide the "Currently Listening To" section; default value: `false`

- `hide_recents` - _(boolean)_ whether or not to hide the "Recently Played Tracks" section; default value: `false`

- `hide_top_tracks` - _(boolean)_ whether or not to hide the "Top Tracks" section; default value: `false`

- `hide_top_artists` - _(boolean)_ whether or not to hide the "Top Artists" section; default value: `false`

- `limit` - _(number)_ the number of items to show for the "Recently Played Tracks," "Top Tracks," and "Top Artists" sections; minimum value: `1`, maximum value: `10`, default value: `5`

To render a data card with any of the customization options, simply append them to the URL as query parameters. Example:

URL for basic data card:

```md
https://data-card-for-spotify.com/api/card?user_id=12146253656
```

URL for data card with border (`&show_border=true`):

```md
https://data-card-for-spotify.com/api/card?user_id=12146253656&show_border=true
```

> **Note 1:** Setting a boolean option to `1` has the same effect as setting it to `true`.

> **Note 2:** The card page of the website at [data-card-for-spotify.com/card](https://www.data-card-for-spotify.com/card) grabs the query params of the page's URL and passes them along to the URL of the interactive data card that gets rendered on the page. This means that you can customize data cards on the site itself and share them from there.

### Examples

#### `&show_border=1`

![show border](docs/show_border.svg)

#### `&show_date=1`

![show date](docs/show_date.svg)

#### `&show_date=1&time_zone=America/Los_Angeles`

![show date with custom time zone](docs/show_date&time_zone.svg)

#### `&custom_title=Custom%20Title`

![custom title](docs/custom_title.svg)

#### `&hide_title=1`

![hide title](docs/hide_title.svg)

#### `&hide_explicit=1`

![hide explicit tracks](docs/hide_explicit.svg)

#### `&hide_playing=1`

![hide currently playing track](docs/hide_playing.svg)

#### `&hide_recents=1`

![hide recently played tracks](docs/hide_recents.svg)

#### `&hide_top_tracks=1`

![hide top tracks](docs/hide_top_tracks.svg)

#### `&hide_top_artists=1`

![hide top artists](docs/hide_top_artists.svg)

#### `&limit=3`

![limit](docs/limit.svg)

## Known Issues

### Animations on WebKit-based browsers

Apple's WebKit browser engine is extremely buggy when rendering CSS animations for SVGs embedded as images. You've probably already noticed this if you're viewing this on one of the following WebKit-based browsers:

- Safari
- Any browser on iOS and iPadOS

My original solution to this problem was to disable animations for data cards requested by browsers that were detected to be WebKit-based. However, since GitHub uses [anonymized URLs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-anonymized-urls) for the images it hosts, this approach doesn't work for data cards embedded in GitHub READMEs—the bugginess is unavoidable for WebKit users. The only remaining options were to either disable animations on all browsers or to just let the issue persist until Apple addresses the issues with their engine. Given that [less than 5% of traffic on GitHub comes from Safari or other WebKit-based browsers](https://github.blog/2022-06-10-how-we-think-about-browsers/), the second option was the obvious choice.

### Spotify Login on Mobile

In some circumstances, on mobile devices, logging in to your Spotify account after clicking the "Generate Card" button on the website fails with an error message. This is due to an issue with Spotify's Accounts service. For the best experience, please use the website on a desktop or laptop.

## Credits

This project was inspired by the following projects and uses some of their code. This section is meant to give credit to the original authors and specify which code was used.

### spotify-github-profile

- Repo: [kittinan/spotify-github-profile](https://github.com/kittinan/spotify-github-profile)
- Code used:
  - ["Natemoo-re theme" SVG template](https://github.com/kittinan/spotify-github-profile/blob/91f15d9b210da5f3a2881e91d5a01c9ae8fd47ab/api/templates/spotify.natemoo-re.html.j2) (translated from Jinja to TSX and modified)
  - ["Novatorem theme" SVG template](https://github.com/kittinan/spotify-github-profile/blob/91f15d9b210da5f3a2881e91d5a01c9ae8fd47ab/api/templates/spotify.novatorem.html.j2) (translated from Jinja to TSX and modified)
  - ["Bar" HTML generation code](https://github.com/kittinan/spotify-github-profile/blob/91f15d9b210da5f3a2881e91d5a01c9ae8fd47ab/api/theme_dev.py#L15) (translated from Python to TypeScript)
  - ["Bar" CSS generation code](https://github.com/kittinan/spotify-github-profile/blob/be37513636f6a77609f59bb33f0936dd4d0bb8a7/api/view.py#L40) (translated from Python to TypeScript)

### Spotify Profile

- Repo: [bchiang7/spotify-profile](https://github.com/bchiang7/spotify-profile)
- Code used:
  - [Loading animation markup](https://github.com/bchiang7/spotify-profile/blob/d78c3c43f23232a7ddf0d859bacb003ad2ffac89/client/src/components/Loader.js) (translated from JSX to SVG and modified)
  - [`getHashParams()` function](https://github.com/bchiang7/spotify-profile/blob/d78c3c43f23232a7ddf0d859bacb003ad2ffac89/client/src/utils/index.js#L2)

## License

[MIT](LICENSE)
