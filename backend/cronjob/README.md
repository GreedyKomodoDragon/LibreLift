# Revoked Account Cleanup CronJob

This go application handles the process or removing all the information for a revoked account. This information covers:

* Searchable indexes
* References to user in main db
* References to user's repos and their products

## Scaling issues with current cronjob

This cronjob is going to be employed as a short-term solution to get accounts revoked, in small scale this should be fine and any errors will be fixed by running the job multiple times.

As we want users to be deleted as quick as possible and as reliable as possible so a single pod will not scale out well to do all this work.

## Long Term solution using Kafka

<b>Note: This will not be started until scale has been reached to deem it required (or there is nothing else to do)</b>

In the long term, this application should be split in multiple event-driven processes with the idea that it will be:

1. Get all the users+subscriptions that are revoked and push this to a topic
2. Multiple consumers will read from this topic to:
    * Cancel all the subscriptions
    * Delete the indexes via getting all a users repotable ids
    * Delete the references in the database

Topic would likely be Kafka based to allow multiple consumers to write from one topic.