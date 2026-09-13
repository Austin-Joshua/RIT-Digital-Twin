package com.university.erp.intelligence;

/** A change that should refresh the single campus state. Not a sensor reading. */
public record CampusStateNotice(String kind, String source, String because) {
}
