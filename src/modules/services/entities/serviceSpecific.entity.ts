import { AbstractEntity } from "src/database/postgres/entities/abstract.entity";
import { Entity, Column, ManyToOne, JoinColumn, } from "typeorm";
import { Plant } from "src/modules/plants/entities/plant.entity";
import { User } from "src/modules/users/entities/user.entity";
