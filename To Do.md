
* Ensure there are no circular dependencies between FunctionMeters e.g. parent <-> child
    * This can probably be done at the MeterDefinition level.  Instead of just pushing to the array of parents, that can be made private and another function can be introduced that will check the parent UUID to see if it has any children with that UUID
* Ensure there is no overlap in meters, where a child has two parents, where one of the parents is a parent of the other parent
* Figure out what to do with past callback request records
    * Keep a number of them?
    * Purge them after taking stock of statistics?
* Implement real / better statistics
* Add ability to overbook the current execution slots when some jobs are stuck waiting for parents to give a callback
* Implement the appropriate functionality around maximum queue length and what to do when that amount is exceeded
